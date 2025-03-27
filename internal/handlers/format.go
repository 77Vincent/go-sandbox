package handlers

import (
	"github.com/gin-gonic/gin"
	"go/format"
	"golang.org/x/tools/imports"
	"net/http"
)

func Format(c *gin.Context) {
	var req request

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response{
			Error:   err.Error(),
			Message: badRequestMessage,
		})
		return
	}

	formatted, err := format.Source([]byte(req.Code))
	if err != nil {
		c.JSON(http.StatusBadRequest, response{
			Error:   err.Error(),
			Message: buildErrorMessage,
		})
		return
	}

	// Configure options: enabling comment preservation, tab settings, etc.
	opts := &imports.Options{
		Comments:  true,
		TabIndent: true,
		TabWidth:  4,
	}
	// Process the source code; this will add missing import statements
	newSrc, err := imports.Process("example.go", formatted, opts)
	if err != nil {
		c.JSON(http.StatusBadRequest, response{
			Error:   err.Error(),
			Message: buildErrorMessage,
		})
		return
	}

	c.JSON(http.StatusOK, response{
		Stdout: string(newSrc),
	})
}
