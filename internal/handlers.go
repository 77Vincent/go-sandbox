package internal

import (
	"github.com/gin-gonic/gin"
	"go/format"
	"net/http"
	"time"
)

const (
	badRequestMessage            = "bad request"
	buildErrorMessage            = "build failed"
	executionTimeoutErrorMessage = "execution timed out"
	executionTimeout             = 10 * time.Second
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
