package internal

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/tianqi-wen_frgr/best-go-playground/config"
	"net/http"
)

// Initialize a Redis client. Adjust the address and options as needed.
var rdb = redis.NewClient(&redis.Options{
	Addr: "redis:6379", // Redis server address
	// Password: "", // no password set
	// DB:       0,  // use default DB
})

// generateHashKey computes a SHA-256 hash for the given code snippet.
func generateHashKey(code []byte) string {
	hash := sha256.Sum256(code)
	return hex.EncodeToString(hash[:16])
}

// Share handles POST requests to save a snippet in Redis.
func Share(c *gin.Context) {
	var req request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, response{
			Error:   err.Error(),
			Message: badRequestMessage,
		})
		return
	}

	// Generate a hash-based key from the code snippet.
	key := generateHashKey([]byte(req.Code))
	// Check if the snippet already exists in Redis.
	_, err := rdb.Get(c, key).Result()

	// snippet not found
	if errors.Is(err, redis.Nil) {
		// Save the snippet in Redis.
		if err = rdb.Set(c, key, req.Code, config.CodeSnippetTTL).Err(); err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
			return
		}
	}

	// other errors
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
		return
	}

	// Construct and return the shareable URL.
	shareURL := fmt.Sprintf("%s/snippet/%s", config.BaseUrl, key)
	c.String(http.StatusOK, shareURL)
}
