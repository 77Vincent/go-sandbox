package internal

import (
	"context"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"net/http"
	"time"
)

const (
	badRequestMessage = "bad request"
	buildErrorMessage = "build failed"
)

var rdb = redis.NewClient(&redis.Options{
	Addr: "redis:6379", // Redis server address
	// Password: "", // no password set
	// DB:       0,  // use default DB
})

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
