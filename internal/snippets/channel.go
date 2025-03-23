package snippets

const Channel = `package main

import (
    "fmt"
    "time"
)

func main() {
    ch1 := make(chan string)
    ch2 := make(chan string)

    // Launch first goroutine
    go func() {
        time.Sleep(1 * time.Second)
        ch1 <- "Message from channel 1"
    }()

    // Launch second goroutine
    go func() {
        time.Sleep(2 * time.Second)
        ch2 <- "Message from channel 2"
    }()

    // Use select to wait on multiple channel operations
    select {
    case msg := <-ch1:
        fmt.Println(msg)
    case msg := <-ch2:
        fmt.Println(msg)
    case <-time.After(1500 * time.Millisecond):
        fmt.Println("Timeout reached without receiving any message")
    }
}`
