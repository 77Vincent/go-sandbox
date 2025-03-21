package internal

import (
	"context"
	"github.com/gin-gonic/gin"
	"net/http"
	"regexp"
	"strings"
	"time"
)

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

// Timeout creates a middleware that enforces a timeout.
func Timeout(timeout time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Create a new context with timeout.
		ctx, cancel := context.WithTimeout(c.Request.Context(), timeout)
		defer cancel()

		// Replace request context with our timeout context.
		c.Request = c.Request.WithContext(ctx)

		// Channels to signal completion and any panic.
		doneChan := make(chan struct{})
		panicChan := make(chan interface{}, 1)

		go func() {
			defer func() {
				if p := recover(); p != nil {
					panicChan <- p
				}
			}()
			// Continue processing the request.
			c.Next()
			close(doneChan)
		}()

		// Wait for whichever event comes first.
		select {
		case p := <-panicChan:
			// If a panic occurred, return an error.
			c.AbortWithStatus(http.StatusInternalServerError)
			panic(p)
		case <-doneChan:
			// Handler finished before the timeout.
			return
		case <-ctx.Done():
			// Timeout exceeded; abort the request.
			c.AbortWithStatusJSON(http.StatusGatewayTimeout, gin.H{"error": "request timed out"})
			return
		}
	}
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
