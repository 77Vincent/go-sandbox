package basic

const Ticker = `package main

import (
    "fmt"
    "time"
)

func main() {
    ticker := time.NewTicker(500 * time.Millisecond)
    done := make(chan bool)

    // Stop the ticker after 3 seconds.
    go func() {
        time.Sleep(3 * time.Second)
        done <- true
    }()

    for {
        select {
        case t := <-ticker.C:
            fmt.Println("Tick at", t)
        case <-done:
            ticker.Stop()
            fmt.Println("Ticker stopped")
            return
        }
    }
}`
