package internal

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/tianqi-wen_frgr/best-go-playground/internal/db"
	"net/http"
)

func Fetch(c *gin.Context) {
	// Fetch the snippet id from the URL parameter.
	id := c.Param("id")
	// Fetch the snippet from Redis.
	code, err := db.Redis().Get(c, id).Result()

	if errors.Is(err, redis.Nil) {
		c.AbortWithStatusJSON(http.StatusNotFound, response{Error: fmt.Sprintf("snippet %s not found", id)})
		return
	}

	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
		return
	}

	c.String(http.StatusOK, code)
}
