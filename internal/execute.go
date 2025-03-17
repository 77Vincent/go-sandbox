package internal

import (
	"context"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/render"
	"github.com/tianqi-wen_frgr/best-go-playground/config"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"sync"
	"time"
)

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
		writeMu sync.Mutex
		wg      sync.WaitGroup
	)
	wg.Add(2)

	// stream 函数：按行读取并写 SSE 数据
	stream := func(r io.Reader, event string, c *gin.Context, wg *sync.WaitGroup) {
		defer wg.Done()

		// 每次读取的块大小，可根据需求调节
		const chunkSize = 256
		buf := make([]byte, chunkSize)

		for {
			// 检查上下文和请求结束
			select {
			case <-ctx.Done():
				return
			case <-c.Request.Context().Done():
				// 客户端断开，杀死子进程
				_ = cmd.Process.Kill()
				return
			default:
			}

			// 尝试从 r 中读取 chunkSize 字节
			var n int
			n, err = r.Read(buf)

			if n == 0 {
				if err != nil {
					if err == io.EOF {
						break
					}
					return // 或处理错误
				}
				continue
			}

			chunk := string(buf[:n])

			// 如果行以清屏控制字符开始，则发送 clear 事件
			if strings.Contains(chunk, "\x0c") {
				writeMu.Lock()
				c.Render(-1, render.Data{
					Data: []byte("event: clear\ndata: \n\n"),
				})
				c.Writer.Flush()
				writeMu.Unlock()

				chunk = strings.ReplaceAll(chunk, "\x0c", "")
			}

			// 针对 stderr 处理
			if event == "stderr" {
				if shouldSkip(chunk) {
					continue
				}
				chunk = processError(chunk)
			}

			// 格式化 SSE 行
			sseLine := fmt.Sprintf("event: %s\ndata: %s\n\n", event, chunk)
			writeMu.Lock()
			_, err = c.Writer.Write([]byte(sseLine))
			if err != nil {
				writeMu.Unlock()
				return
			}
			c.Writer.Flush()
			writeMu.Unlock()
		}
	}

	go stream(stdout, "stdout", c, &wg)
	go stream(stderr, "stderr", c, &wg)

	// 等待进程结束
	err = cmd.Wait()
	wg.Wait()

	if errors.Is(ctx.Err(), context.DeadlineExceeded) {
		writeMu.Lock()
		c.Render(-1, render.Data{
			Data: []byte("event: timeout\ndata: Execution timed out(5s).\n\n"),
		})
		c.Writer.Flush()
		writeMu.Unlock()
		return
	}

	if err != nil {
		writeMu.Lock()
		c.Render(-1, render.Data{
			Data: []byte(fmt.Sprintf("event: error\ndata: %v\n\n", err)),
		})
		c.Writer.Flush()
		writeMu.Unlock()
		return
	}

	writeMu.Lock()
	c.Render(-1, render.Data{
		Data: []byte("event: done\ndata: Execution finished.\n\n"),
	})
	c.Writer.Flush()
	writeMu.Unlock()
}
