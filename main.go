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

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"https://www.go-sandbox.org",
			"https://go-sandbox.org",
			"https://main.d25pqeeloarr3n.amplifyapp.com",
		},
		AllowMethods: []string{"POST, GET, OPTIONS, PUT, DELETE"},
	}))

	// a global timeout middleware as a safety net
	timeout := internal.Timeout(config.APIGlobalTimeout * time.Second)

	// routes
	r.GET("/status", timeout, internal.Status)
	r.POST("/format", timeout, internal.Format)
	r.POST("/execute", internal.Execute)

	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
