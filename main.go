package main

import (
	"bytes"
	"fmt"
	"go/format"
	"net/http"
	"os"
	"os/exec"

	"github.com/gin-gonic/gin"
)

type reqPayload struct {
	Code    string `json:"code" binding:"required"`
	Version string `json:"version"`
}

func main() {
	r := gin.Default()

	r.GET("/status", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	r.POST("/format", func(c *gin.Context) {
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

		c.JSON(http.StatusOK, string(formatted))
	})

	r.POST("/execute", func(c *gin.Context) {
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
		tmp.Close()

		// execute the code in a new process
		cmd := exec.Command("go", "run", tmp.Name())
		var out bytes.Buffer
		cmd.Stdout = &out
		cmd.Stderr = &out

		if err = cmd.Run(); err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("%s: %v", err, out.String())})
			return
		}

		c.JSON(http.StatusOK, gin.H{"output": out.String()})
	})

	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
