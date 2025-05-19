package basic

const Defer = `package main

import "fmt"

func main() {
    fmt.Println("Start")
    defer fmt.Println("Deferred: End") // This will execute after main() completes
    fmt.Println("Middle")
}`
