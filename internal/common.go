package internal

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

const (
	badRequestMessage = "bad request"
	buildErrorMessage = "build failed"
)

func Status(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "pong test",
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
