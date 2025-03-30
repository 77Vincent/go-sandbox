package design_pattern

const Bridge = `// Bridge Pattern is a structural design pattern that decouples an abstraction from its implementation.
package main

import "fmt"

// Color defines the implementation interface for colors.
type Color interface {
	ApplyColor()
}

// RedColor is a concrete implementation of Color.
type RedColor struct{}

func (RedColor) ApplyColor() {
	fmt.Println("Applying red color.")
}

// GreenColor is another concrete implementation of Color.
type GreenColor struct{}

func (GreenColor) ApplyColor() {
	fmt.Println("Applying green color.")
}

// Shape defines the abstraction that references a Color.
type Shape interface {
	Draw()
}

// Circle is a refined abstraction that delegates color application.
type Circle struct {
	radius int
	color  Color
}

func (c Circle) Draw() {
	fmt.Printf("Drawing Circle with radius %d. ", c.radius)
	c.color.ApplyColor()
}

func main() {
	red := RedColor{}
	green := GreenColor{}

	circle1 := Circle{radius: 5, color: red}
	circle2 := Circle{radius: 10, color: green}

	circle1.Draw()
	circle2.Draw()
}`
