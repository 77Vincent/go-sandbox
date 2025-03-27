package main

import (
	"github.com/gin-gonic/gin"
	"github.com/tianqi-wen_frgr/go-sandbox/config"
	"github.com/tianqi-wen_frgr/go-sandbox/internal/handlers"
	"github.com/tianqi-wen_frgr/go-sandbox/internal/worker"
	"time"
)

func init() {
	// do not stop the ticker throughout the lifecycle of the application
	ticker := time.NewTicker(1 * time.Minute)

	go func() {
		for {
			select {
			case <-ticker.C:
				if err := worker.CleanupWorkspace(config.WorkspacePath); err != nil {
					panic(err)
				}
			}
		}
	}()
}

func main() {
	r := gin.Default()

	//r.Use(cors.New(cors.Config{
	//	AllowOrigins: []string{
	//		"http://localhost:5173", // for development
	//		"https://go-sandbox.org",
	//		"https://www.go-sandbox.org",
	//		"https://main.d1iv3tkpxynolc.amplifyapp.com",
	//	},
	//	AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	//	// Allowed headers (adjust as needed for auth tokens, etc.)
	//	AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
	//	// Expose headers to the client if you need the browser to read them
	//	ExposeHeaders: []string{"Content-Length"},
	//	// If you need to include cookies or auth headers in requests
	//	AllowCredentials: true,
	//	// How long to cache preflight requests
	//	MaxAge: 12 * time.Hour,
	//}))

	// a global timeout middleware as a safety net
	timeout := handlers.Timeout(config.APIGlobalTimeout * time.Second)

	r.Use(gin.CustomRecovery(handlers.PanicRecovery))

	// routes
	r.GET("/status", timeout, handlers.Status)
	r.GET("/templates/:id", timeout, handlers.GetTemplate)
	r.POST("/format", timeout, handlers.Format)
	r.POST("/snippet", timeout, handlers.ShareSnippet)
	r.GET("/snippet/:id", timeout, handlers.FetchSnippet)
	r.POST("/execute", handlers.Execute)

	r.Run(config.ApiServerPort)
}
