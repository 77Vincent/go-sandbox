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
			"http://localhost:5173", // for development
			"https://go-sandbox.org",
			"https://www.go-sandbox.org",
			"https://main.d1iv3tkpxynolc.amplifyapp.com",
		},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		// Allowed headers (adjust as needed for auth tokens, etc.)
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
		// Expose headers to the client if you need the browser to read them
		ExposeHeaders: []string{"Content-Length"},
		// If you need to include cookies or auth headers in requests
		AllowCredentials: true,
		// How long to cache preflight requests
		MaxAge: 12 * time.Hour,
	}))

	// a global timeout middleware as a safety net
	timeout := internal.Timeout(config.APIGlobalTimeout * time.Second)

	// routes
	r.GET("/status", timeout, internal.Status)
	r.POST("/format", timeout, internal.Format)
	r.POST("/execute", internal.Execute)

	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
