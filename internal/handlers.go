package internal

import (
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"net/http"
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
