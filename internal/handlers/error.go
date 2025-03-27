package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// PanicRecovery is a custom recovery function that returns a JSON error response when a panic occurs.
func PanicRecovery(c *gin.Context, recovered interface{}) {
	if err, ok := recovered.(error); ok {
		c.AbortWithStatusJSON(http.StatusInternalServerError, c.Error(err))
		return
	}
	c.AbortWithStatus(http.StatusInternalServerError)
}
