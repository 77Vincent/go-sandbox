package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/tianqi-wen_frgr/best-go-playground/config"
	"github.com/tianqi-wen_frgr/best-go-playground/internal"
	"time"
)

func main() {
	r := gin.Default()

	r.Use(cors.Default())

	// a global timeout middleware as a safety net
	timeout := internal.Timeout(config.APIGlobalTimeout * time.Second)

	// routes
	r.GET("/status", timeout, internal.Status)
	r.POST("/format", timeout, internal.Format)
	r.POST("/execute", internal.Execute)

	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
