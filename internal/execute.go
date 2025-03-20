package internal

import (
	"context"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/render"
	"github.com/tianqi-wen_frgr/best-go-playground/config"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"sync"
	"time"
)

const chunkSize = 1

func send(line []byte, event string, c *gin.Context, lock *sync.Mutex) {
	// skip sending if no data
	if len(line) == 0 {
		return
	}

	data := fmt.Sprintf("event:%s\ndata:%s\n\n", event, line)

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

	// 1) 创建临时文件并写入用户代码
	tmp, err := os.CreateTemp("", "code-*.go")
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

	// 2) 创建带超时的 context
	ctx, cancel := context.WithTimeout(context.Background(), config.ExecuteAPITimeout*time.Second)
	defer cancel()

	// 3) 使用 exec.CommandContext 关联 context，调用 sandbox-runner
	cmd := exec.CommandContext(ctx, "sandbox-runner", tmp.Name())

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
		return
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
		return
	}

	if err = cmd.Start(); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
		return
	}

	// 4) 设置 SSE 响应头
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")

	// 创建一个互斥锁，保护 c.Writer 写入
	var (
		lock sync.Mutex
		wg   sync.WaitGroup
	)
	wg.Add(2)

	// stream 函数：按行读取并写 SSE 数据
	stream := func(r io.Reader, event string, c *gin.Context, wg *sync.WaitGroup) {
		defer wg.Done()

		var (
			buf  = make([]byte, chunkSize)
			line []byte
		)

		for {
			select {
			case <-ctx.Done():
				return
			case <-c.Request.Context().Done():
				if err = cmd.Process.Kill(); err != nil {
					log.Fatalf("failed to kill process: %s", err)
				}
				return
			default:
			}

			var n int
			n, err = r.Read(buf)

			if n == 0 {
				if err != nil {
					send(line, event, c, &lock)

					break
					//if err == io.EOF {
					//	break
					//}
					//break
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

	go stream(stdout, "stdout", c, &wg)
	go stream(stderr, "stderr", c, &wg)

	wg.Wait()

	// 等待进程结束
	err = cmd.Wait()
	if err != nil {
		lock.Lock()
		defer lock.Unlock()

		c.Render(-1, render.Data{
			Data: []byte(fmt.Sprintf("event:error\ndata:%v\n\n", err)),
		})
		c.Writer.Flush()
		return
	}

	if errors.Is(ctx.Err(), context.DeadlineExceeded) {
		c.Render(-1, render.Data{
			Data: []byte("event:timeout\ndata:Execution timed out(5s).\n\n"),
		})
		c.Writer.Flush()
		return
	}

	c.Render(-1, render.Data{
		Data: []byte("event:done\ndata:Execution finished.\n\n"),
	})
	c.Writer.Flush()
}
