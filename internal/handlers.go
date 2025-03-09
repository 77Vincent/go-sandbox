package internal

import (
	"bytes"
	"context"
	"errors"
	"github.com/gin-gonic/gin"
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

func Execute(c *gin.Context) {
	var req request

	if err := c.ShouldBindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, response{
			Error:   err.Error(),
			Message: badRequestMessage,
		})
		return
	}

	// generate a temporary file for the code
	tmp, err := os.CreateTemp("", "code-*.go")
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{
			Error: err.Error(),
		})
		return
	}
	defer os.Remove(tmp.Name()) // remove the file when we're done

	// write the formatted code to the file
	if _, err = tmp.Write([]byte(req.Code)); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{
			Error: err.Error(),
		})
		return
	}
	if err = tmp.Close(); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{
			Error: err.Error(),
		})
		return
	}

	// 2) Create a context with a timeout.
	//    If the user's code runs longer than 3 seconds, it will be killed.
	ctx, cancel := context.WithTimeout(context.Background(), executionTimeout)
	defer cancel()

	// 3) Create the command using exec.CommandContext so it is tied to the context.
	cmd := exec.CommandContext(ctx, "go", "run", tmp.Name())

	// We can capture stdout and stderr separately:
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{
			Error: err.Error(),
		})
		return
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{
			Error: err.Error(),
		})
		return
	}

	// Start the process.
	if err = cmd.Start(); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{
			Error: err.Error(),
		})
		return
	}

	// 4) Read from stdout and stderr concurrently, storing the results in buffers.
	var outBuf, errBuf bytes.Buffer
	wg := &sync.WaitGroup{}
	wg.Add(2)

	go func() {
		defer wg.Done()
		io.Copy(&outBuf, stdout)
	}()
	go func() {
		defer wg.Done()
		io.Copy(&errBuf, stderr)
	}()

	// Wait for the command to finish, or for the context to time out.
	err = cmd.Wait()
	wg.Wait() // wait until stdout/stderr copying is done

	// If the context timed out or was canceled, the command was killed.
	if errors.Is(ctx.Err(), context.DeadlineExceeded) {
		c.AbortWithStatusJSON(http.StatusGatewayTimeout, response{
			Message: executionTimeoutErrorMessage,
			Stderr:  parseStderrMessages(errBuf.String()),
			Stdout:  outBuf.String(),
		})
		return
	}

	// If there was some other error from the command, return that.
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, response{
			Message: buildErrorMessage,
			Error:   err.Error(),
			Stderr:  parseStderrMessages(errBuf.String()),
			Stdout:  outBuf.String(),
		})
		return
	}

	// If everything is good, return the captured stdout/stderr.
	c.JSON(http.StatusOK, response{
		Stdout: outBuf.String(),
		Stderr: parseStderrMessages(errBuf.String()),
	})
}
