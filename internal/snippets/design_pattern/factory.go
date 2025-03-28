package design_pattern

const Factory = `// Factory pattern provides a way to create instances of a class without exposing the creation logic to the client
package main

import "fmt"

type Shape interface {
    Draw()
}

type Circle struct{}
func (c Circle) Draw() {
    fmt.Println("Drawing a circle")
}

type Square struct{}
func (s Square) Draw() {
    fmt.Println("Drawing a square")
}

// ShapeFactory returns an instance of Shape based on the input type.
func ShapeFactory(shapeType string) Shape {
    switch shapeType {
    case "circle":
        return Circle{}
    case "square":
        return Square{}
    default:
        return nil
    }
}

func main() {
    shape1 := ShapeFactory("circle")
    shape1.Draw()
    shape2 := ShapeFactory("square")
    shape2.Draw()
}`
