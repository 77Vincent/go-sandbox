package main

import (
	"github.com/gin-gonic/gin"
	"github.com/tianqi-wen_frgr/best-go-playground/config"
	"github.com/tianqi-wen_frgr/best-go-playground/internal"
	"time"
)

func main() {
	r := gin.Default()

	// a global timeout middleware as a safety net
	r.Use(internal.Timeout(config.APIGlobalTimeout * time.Second))

	// routes
	r.GET("/status", internal.Status)
	r.POST("/format", internal.Format)
	r.POST("/execute", internal.Execute)

	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
