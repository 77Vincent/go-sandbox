package handlers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"regexp"
	"strings"
)

var (
	validPath = regexp.MustCompile(`^file://[0-9A-Za-z._\-/:]+$`)
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

	if path == "" {
		c.JSON(http.StatusBadRequest, fetchSourceRes{Error: "path is required"})
		return
	}

	if !validPath.MatchString(path) {
		c.JSON(http.StatusBadRequest, fetchSourceRes{Error: "invalid path"})
		return
	}

	path = strings.TrimPrefix(path, "file://")

	// check if it is the main file
	if strings.HasPrefix(path, "/workspace/go") {
		c.JSON(http.StatusOK, fetchSourceRes{IsMain: true})
		return
	}

	if !strings.HasPrefix(path, "/usr/local/go") {
		c.JSON(http.StatusBadRequest, fetchSourceRes{Error: "path must be in /usr/local/go"})
		return
	}

	// choose the correct version
	path = strings.Replace(path, "/usr/local/go", "/go"+version, 1)

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
