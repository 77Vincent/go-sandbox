package internal

import (
	"github.com/gin-gonic/gin"
)

const (
	sleepCode = `package main

import (
	"fmt"
	"math/rand"
	"time"
)

func main() {
	for i := 0; i < 10; i++ {
		dur := time.Duration(rand.Intn(1000)) * time.Millisecond
		fmt.Printf("Sleeping for %v\n", dur)
		// Sleep for a random duration between 0-1000ms
		time.Sleep(dur)
	}
	fmt.Println("Done!")
}`
)

func GetTemplate(c *gin.Context) {
	id := c.Param("id")
	switch id {
	case "sleep":
		c.String(200, sleepCode)
	default:
		c.String(404, "template not found")
	}
}
