package internal

import (
	"github.com/gin-gonic/gin"
	"go/format"
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

	c.JSON(http.StatusOK, response{
		Stdout: string(formatted),
	})
}
