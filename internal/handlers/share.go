package handlers

import (
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/tianqi-wen_frgr/go-sandbox/config"
	"github.com/tianqi-wen_frgr/go-sandbox/internal/db"
	"net/http"
	"time"
)

// generateHashKey computes a SHA-256 hash for the given code snippet.
func generateHashKey(code []byte) string {
	hash := sha256.Sum256(code)
	return base64.RawURLEncoding.EncodeToString(hash[:])[:16]
}

// ShareSnippet handles POST requests to save a snippet in Redis.
func ShareSnippet(c *gin.Context) {
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
	_, err := db.Redis().Get(c, key).Result()

	// snippet not found
	if errors.Is(err, redis.Nil) {
		// Save the snippet in Redis.
		if err = db.Redis().Set(c, key, req.Code, config.CodeSnippetTTL*time.Hour).Err(); err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
			return
		}
	}

	// other errors
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
		return
	}

	c.String(http.StatusOK, key)
}
