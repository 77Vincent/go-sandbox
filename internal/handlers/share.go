package handlers

import (
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/tianqi-wen_frgr/go-sandbox/internal/db"
	"net/http"
)

// generateHashKey computes a SHA-256 hash for the given code snippet.
func generateHashKey(code []byte) string {
	hash := sha256.Sum256(code)
	return base64.RawURLEncoding.EncodeToString(hash[:])[:16]
}

// ShareSnippet handles POST requests to save a snippet in S3.
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

	// Check if the snippet already exists in S3.
	_, err := db.S3().GetObject(c, key)
	if err != nil {
		if errors.Is(err, db.ErrObjectNotFound) {
			// Save the snippet in S3.
			if e := db.S3().PutObject(c, key, []byte(req.Code)); e != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: e.Error()})
				return
			}
			goto done
		}

		// Handle other errors.
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
		return
	}

done:
	c.String(http.StatusOK, key)
}
