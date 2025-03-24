package internal

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/render"
	"github.com/tianqi-wen_frgr/best-go-playground/config"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"strings"
	"sync"
)

const (
	chunkSize       = 1
	stdoutKey       = "stdout"
	stderrKey       = "stderr"
	sandboxRunner1  = "sandbox-runner-1"
	sandboxRunner2  = "sandbox-runner-2"
	tmpFileName     = "code-*.go"
	tmpTestFileName = "code-*_test.go"
	timeoutError    = "exit status 124"
)

func send(line []byte, event string, c *gin.Context, lock *sync.Mutex) {
	// skip sending if no data
	if len(line) == 0 {
		return
	}

	if event == stderrKey {
		if shouldSkip(line) {
			return
		}

		line = processError(line)
	}

	data := fmt.Sprintf("event:%s\ndata:%s\n\n", event, line)

	// start sending with lock
	lock.Lock()
	defer lock.Unlock()

	if _, err := c.Writer.Write([]byte(data)); err != nil {
		log.Printf("failed to send event to client: %s", err)
		return
	}
	c.Writer.Flush()
}

// Execute 实现 SSE 流式输出
func Execute(c *gin.Context) {
	var req request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, response{
			Error:   err.Error(),
			Message: badRequestMessage,
		})
		return
	}

	var (
		fileName       = tmpFileName
		sandboxVersion = sandboxRunner1
	)
	if isTestCode(req.Code) {
		fileName = tmpTestFileName
	}

	switch req.Version {
	case "1":
		sandboxVersion = sandboxRunner1
	case "2":
		sandboxVersion = sandboxRunner2
	}
	fmt.Println("sandboxVersion:", sandboxVersion)

	// 1) 创建临时文件并写入用户代码
	tmp, err := os.CreateTemp("", fileName)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
		return
	}
	defer os.Remove(tmp.Name())

	if _, err = tmp.Write([]byte(req.Code)); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
		return
	}
	if err = tmp.Close(); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
		return
	}

	cmd := exec.Command(sandboxVersion, tmp.Name())

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
		return
	}
	defer stdout.Close()
	stderr, err := cmd.StderrPipe()
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
		return
	}
	defer stderr.Close()

	// 4) 设置 SSE 响应头
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")

	// 创建一个互斥锁，保护 c.Writer 写入
	var (
		lock sync.Mutex
		wg   sync.WaitGroup
	)
	// stream 函数：按行读取并写 SSE 数据
	stream := func(r io.ReadCloser, event string, c *gin.Context, wg *sync.WaitGroup) {
		defer wg.Done()

		var (
			buf  = make([]byte, chunkSize)
			line []byte
		)

		for {
			select {
			case <-c.Request.Context().Done():
				if err = cmd.Process.Kill(); err != nil {
					log.Fatalf("failed to kill process: %s", err)
				}
				return
			default:
			}

			n, e := r.Read(buf)

			if n == 0 {
				if e != nil {
					if e == io.EOF {
						// just a double check, if context is not done, send remaining data
						if c.Request.Context().Err() == nil {
							// send remaining data if any
							send(line, event, c, &lock)
						}
						return
					}
					log.Printf("failed to read from %s: %s", event, e)
					return // equal to break actually
				}
				continue
			}

			b := buf[0]

			switch b {
			case '\n':
				send(line, event, c, &lock)
				line = []byte{} // reset
			case '\x0c':
				// send remaining data first
				send(line, event, c, &lock)

				// send clear event
				lock.Lock()
				c.Render(-1, render.Data{
					Data: []byte("event:clear\ndata:\n\n"),
				})
				lock.Unlock()

				line = []byte{} // reset
			default:
				line = append(line, b)
			}
		}
	}

	if err = cmd.Start(); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
		return
	}

	wg.Add(2)

	go stream(stdout, stdoutKey, c, &wg)
	go stream(stderr, stderrKey, c, &wg)

	// wait for both goroutines to finish
	wg.Wait()

	// wait for the command to finish
	if err = cmd.Wait(); err != nil {
		lock.Lock()
		defer lock.Unlock()

		// timeout case
		if err.Error() == timeoutError {
			c.Render(-1, render.Data{
				Data: []byte(fmt.Sprintf("event:error\ndata:Execution timed out(%ds).\n\n", config.SandboxCPUTimeLimit)),
			})
			c.Writer.Flush()
			return
		}

		// other error cases
		c.Render(-1, render.Data{
			Data: []byte(fmt.Sprintf("event:error\ndata:%v\n\n", err)),
		})
		c.Writer.Flush()
		return
	}

	lock.Lock()
	defer lock.Unlock()

	// lastly send done event
	c.Render(-1, render.Data{
		Data: []byte("event:done\ndata:Execution finished.\n\n"),
	})
	c.Writer.Flush()
}

var (
	errorRe    = regexp.MustCompile(`^/tmp/code-[0-9]*\.go:`) // /tmp/code-123.go:
	skipError  = regexp.MustCompile(`^# command-line-arguments`)
	skipError2 = regexp.MustCompile(`^[0-9]{4}/[0-9]{2}/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2} (Build|Execution) error: exit status [0-9]+`) // 2021/08/01 00:00:00
)

// these errors will not be return to users
func shouldSkip(line []byte) bool {
	return skipError.Match(line) || skipError2.Match(line)
}

func processError(line []byte) []byte {
	return errorRe.ReplaceAll(line, []byte(""))
}

func isTestCode(code string) bool {
	// If we see `func main(`, assume it has a main function
	// this can prevent going through the code too further because func main usually appears at the beginning of the code
	if strings.Contains(code, "func main(") {
		return false
	}

	// If we see `func Test` or `func Benchmark`, assume it’s test code
	// (You might refine this check for package _test or other details)
	if strings.Contains(code, "func Test") || strings.Contains(code, "func Benchmark") {
		return true
	}

	return false
}
