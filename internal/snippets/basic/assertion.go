package basic

const Assertion = `package main

import "fmt"

// Define an interface with a method
type Speaker interface {
    Speak() string
}

type Dog struct{}
type Cat struct{}

func (d Dog) Speak() string {
    return "Woof!"
}

func (c Cat) Speak() string {
    return "Meow!"
}

func main() {
    var s Speaker

    s = Dog{}
    fmt.Println("Dog says:", s.Speak())

    s = Cat{}
    fmt.Println("Cat says:", s.Speak())

    // Type assertion to determine the concrete type
    if dog, ok := s.(Dog); ok {
        fmt.Println("It's a dog:", dog)
    } else {
        fmt.Println("Not a dog")
    }
}`
