package snippets

const ContextCancel = `package main

import (
    "context"
    "fmt"
    "time"
)

func worker(ctx context.Context) {
    for {
        select {
        case <-ctx.Done():
            fmt.Println("Worker stopped:", ctx.Err())
            return
        default:
            fmt.Println("Worker is running...")
            time.Sleep(500 * time.Millisecond)
        }
    }
}

func main() {
    // Create a context that cancels after 2 seconds.
    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel()

    go worker(ctx)

    // Wait until the context is done.
    <-ctx.Done()
    fmt.Println("Main: Context cancelled")
}`
