package handlers

import (
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/tianqi-wen_frgr/go-sandbox/internal/db"
	"net/http"
)

func FetchSnippet(c *gin.Context) {
	// FetchSnippet the snippet id from the URL parameter.
	id := c.Param("id")
	// fetch snippets from s3
	snippet, err := db.S3().GetObject(c, id)

	if err != nil {
		if errors.Is(err, db.ErrObjectNotFound) {
			c.AbortWithStatusJSON(http.StatusNotFound, response{
				Error:   err.Error(),
				Message: "Snippet not found",
			})
			return
		}
		c.AbortWithStatusJSON(http.StatusInternalServerError, response{Error: err.Error()})
		return
	}

	c.String(http.StatusOK, string(snippet))
}
