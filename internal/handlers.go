package internal

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/render"
	"go/format"
	"io"
	"net/http"
	"os"
	"os/exec"
	"sync"
	"time"
)

const (
	badRequestMessage            = "bad request"
	buildErrorMessage            = "build failed"
	executionTimeoutErrorMessage = "execution timed out"
	executionTimeout             = 5 * time.Second
)

func Status(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "pong",
	})
}

type request struct {
	Code    string `json:"code" binding:"required"`
	Version string `json:"version"`
}

type response struct {
	Stderr  string `json:"stderr"`
	Stdout  string `json:"stdout"`
	Error   string `json:"error"`
	Message string `json:"message"`
}

func Format(c *gin.Context) {
	var req request

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response{
			Error:   err.Error(),
			Message: badRequestMessage,
		})
		return
	}

	formatted, err := format.Source([]byte(req.Code))
	if err != nil {
		c.JSON(http.StatusBadRequest, response{
			Error:   err.Error(),
			Message: buildErrorMessage,
		})
		return
	}

	c.JSON(http.StatusOK, response{
		Stdout: string(formatted),
	})
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
	ctx, cancel := context.WithTimeout(context.Background(), executionTimeout)
	defer cancel()

	// 3) 使用 exec.CommandContext 关联 context
	cmd := exec.CommandContext(ctx, "go", "run", tmp.Name())

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

	// 启动进程
	if err = cmd.Start(); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
		return
	}

	// 4) 设置 SSE 响应头
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")

	// 用于并发读取 stdout/stderr
	var wg sync.WaitGroup
	wg.Add(2)

	// 按行读取并发送 SSE 的函数
	readAndStream := func(r io.Reader, eventName string) {
		defer wg.Done()

		scanner := bufio.NewScanner(r)
		for scanner.Scan() {
			select {
			case <-ctx.Done():
				return
			case <-c.Request.Context().Done():
				// 如果想在客户端断开时也终止子进程，可在此调用 cmd.Process.Kill()
				return
			default:
				line := scanner.Text()
				// SSE 格式: event: <eventName>\ndata: <data>\n\n
				c.Render(-1, render.Data{
					Data: []byte(fmt.Sprintf("event: %s\ndata: %s\n\n", eventName, line)),
				})
				c.Writer.Flush()
			}
		}
	}

	// 并发读取 stdout/stderr
	go readAndStream(stdout, "stdout")
	go readAndStream(stderr, "stderr")

	// 等待进程结束
	err = cmd.Wait()
	wg.Wait() // 等待读取协程结束

	// 判断是否超时
	if errors.Is(ctx.Err(), context.DeadlineExceeded) {
		c.Render(-1, render.Data{
			Data: []byte("event: timeout\ndata: Execution timed out.\n\n"),
		})
		c.Writer.Flush()
		return
	}

	// 如果有其他错误
	if err != nil {
		c.Render(-1, render.Data{
			Data: []byte(fmt.Sprintf("event: error\ndata: %v\n\n", err)),
		})
		c.Writer.Flush()
		return
	}

	// 正常结束，发送 done 事件
	c.Render(-1, render.Data{
		Data: []byte("event: done\ndata: Execution finished.\n\n"),
	})
	c.Writer.Flush()
}
