package basic

const Goroutine = `package main

import (
    "fmt"
    "sync"
    "time"
)

func worker(id int, wg *sync.WaitGroup) {
    defer wg.Done() // Mark this goroutine as done when the function returns
    fmt.Printf("Worker %d starting\n", id)
    time.Sleep(1 * time.Second) // Simulate work by sleeping for 1 second
    fmt.Printf("Worker %d done\n", id)
}

func main() {
    var wg sync.WaitGroup

    // Launch 5 worker goroutines
    for i := 1; i <= 5; i++ {
        wg.Add(1) // Increment the WaitGroup counter
        go worker(i, &wg) // Launch the worker as a goroutine
    }

    // Wait for all goroutines to complete
    wg.Wait()
    fmt.Println("All workers completed.")
}`
