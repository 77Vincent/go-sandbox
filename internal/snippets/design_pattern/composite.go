package design_pattern

const Composite = `// Composite Pattern is a structural pattern that allows you to compose objects into tree structures to represent part-whole hierarchies.
package main

import "fmt"

// Graphic defines the interface for both simple and complex objects.
type Graphic interface {
	Draw()
}

// Circle is a leaf node that implements Graphic.
type Circle struct {
	name string
}

func (c Circle) Draw() {
	fmt.Println("Drawing circle:", c.name)
}

// CompositeGraphic can hold other Graphic objects.
type CompositeGraphic struct {
	children []Graphic
}

func (cg *CompositeGraphic) Draw() {
	for _, child := range cg.children {
		child.Draw()
	}
}

func (cg *CompositeGraphic) Add(g Graphic) {
	cg.children = append(cg.children, g)
}

func main() {
	c1 := Circle{"Circle1"}
	c2 := Circle{"Circle2"}
	c3 := Circle{"Circle3"}

	composite := &CompositeGraphic{}
	composite.Add(c1)
	composite.Add(c2)
	composite.Add(c3)

	fmt.Println("Drawing Composite:")
	composite.Draw()
}`
