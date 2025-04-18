package handlers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"strings"
)

type fetchSourceRes struct {
	Error   string `json:"error,omitempty"`
	Content string `json:"content,omitempty"`
	IsMain  bool   `json:"is_main"`
}

// FetchSource handles the request to fetch the source code from a given path.
func FetchSource(c *gin.Context) {
	var (
		path    = c.Query("path")
		version = c.Query("version")
	)
	if strings.Contains(path, "/usr/local/go") {
		path = strings.Replace(path, "/usr/local/go", "/go"+version, 1)
	}
	if strings.Contains(path, "/workspace/go") {
		c.JSON(http.StatusOK, fetchSourceRes{IsMain: true})
		return
	}
	content, err := os.ReadFile(path)
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("failed to read file: %s", err.Error()))
		return
	}
	// Set the content type to text/plain
	c.Header("Content-Type", "text/plain")
	c.JSON(http.StatusOK, fetchSourceRes{
		Content: string(content),
	})
}
