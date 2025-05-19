package design_pattern

const Visitor = `// Visitor Pattern is a behavioral design pattern that lets you separate algorithms from the objects on which they operate.
package main

import "fmt"

// Element interface defines an accept method for the visitor.
type Element interface {
	Accept(v Visitor)
}
// ConcreteElementA is a concrete implementation of Element.
type ConcreteElementA struct {
	Name string
}
func (e *ConcreteElementA) Accept(v Visitor) {
	v.VisitConcreteElementA(e)
}
// ConcreteElementB is another concrete implementation of Element.
type ConcreteElementB struct {
	Name string
}
func (e *ConcreteElementB) Accept(v Visitor) {
	v.VisitConcreteElementB(e)
}
// Visitor interface defines visit methods for each concrete element.
type Visitor interface {
	VisitConcreteElementA(e *ConcreteElementA)
	VisitConcreteElementB(e *ConcreteElementB)
}
// ConcreteVisitor is a concrete implementation of Visitor.
type ConcreteVisitor struct{}
func (v *ConcreteVisitor) VisitConcreteElementA(e *ConcreteElementA) {
	fmt.Printf("Visiting ConcreteElementA: %s\n", e.Name)
}
func (v *ConcreteVisitor) VisitConcreteElementB(e *ConcreteElementB) {
	fmt.Printf("Visiting ConcreteElementB: %s\n", e.Name)
}
func main() {
	// Create elements
	elementA := &ConcreteElementA{Name: "Element A"}
	elementB := &ConcreteElementB{Name: "Element B"}

	// Create visitor
	visitor := &ConcreteVisitor{}

	// Accept visitor
	elementA.Accept(visitor)
	elementB.Accept(visitor)
}
`
