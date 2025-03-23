package internal

import (
	"github.com/gin-gonic/gin"
	"github.com/tianqi-wen_frgr/best-go-playground/internal/snippets"
	"net/http"
)

const (
	notFoundError = "template not found"
	// basic
	sleepCase      = "sleep"
	httpServerCase = "httpServer"
	switchCaseCase = "switchCase"
	// problems
	// fun
)

func GetTemplate(c *gin.Context) {
	id := c.Param("id")
	switch id {
	case sleepCase:
		c.String(http.StatusOK, snippets.Sleep)
	case httpServerCase:
		c.String(http.StatusOK, snippets.HttpServer)
	case switchCaseCase:
		c.String(http.StatusOK, snippets.SwitchCase)
	default:
		c.String(http.StatusNotFound, notFoundError)
	}
}
