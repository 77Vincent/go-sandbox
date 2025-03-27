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

	// a global timeout middleware as a safety net
	timeout := handlers.Timeout(config.APIGlobalTimeout * time.Second)

	r.Use(gin.CustomRecovery(handlers.PanicRecovery))

	// routes
	r.GET("/status", timeout, handlers.Status)
	r.GET("/templates/:id", timeout, handlers.GetTemplate)
	r.POST("/format", timeout, handlers.Format)
	r.POST("/snippets", timeout, handlers.ShareSnippet)
	r.GET("/snippets/:id", timeout, handlers.FetchSnippet)
	r.POST("/execute", handlers.Execute)

	r.Run(config.ApiServerPort)
}
