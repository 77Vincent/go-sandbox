package internal

import (
	"bytes"
	"fmt"
	"github.com/gin-gonic/gin"
	"go/format"
	"net/http"
	"os"
	"os/exec"
)

func Status(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "pong",
	})
}

type reqPayload struct {
	Code    string `json:"code" binding:"required"`
	Version string `json:"version"`
}

func Format(c *gin.Context) {
	var req reqPayload

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	formatted, err := format.Source([]byte(req.Code))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"output": string(formatted)})
}

func Execute(c *gin.Context) {
	var req reqPayload

	if err := c.ShouldBindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// generate a temporary file for the code
	tmp, err := os.CreateTemp("", "code-*.go")
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer os.Remove(tmp.Name()) // remove the file when we're done

	// write the formatted code to the file
	if _, err = tmp.Write([]byte(req.Code)); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err.Error())
		return
	}
	if err = tmp.Close(); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err.Error())
		return
	}

	// execute the code in a new process
	cmd := exec.Command("go", "run", tmp.Name())
	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &out

	if err = cmd.Run(); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("%s: %v", err, out.String())})
		return
	}

	c.JSON(http.StatusOK, gin.H{"output": out.String()})
}
