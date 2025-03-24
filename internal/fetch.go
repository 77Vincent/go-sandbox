package internal

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/tianqi-wen_frgr/go-sandbox/internal/db"
	"net/http"
)

func FetchSnippet(c *gin.Context) {
	// FetchSnippet the snippet id from the URL parameter.
	id := c.Param("id")
	// FetchSnippet the snippet from Redis.
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
