package design_pattern

const State = `// State Pattern is a behavioral design pattern that allows an object to change its behavior when its internal state changes.
package main

import (
	"fmt"
)

// State interface defines the behavior of different states.
type State interface {
	HandleRequest()
}
// ConcreteStateA is a concrete implementation of State.
type ConcreteStateA struct {
	context *Context
}
func (s *ConcreteStateA) HandleRequest() {
	fmt.Println("Handling request in ConcreteStateA.")
	s.context.SetState(&ConcreteStateB{context: s.context})
}
// ConcreteStateB is another concrete implementation of State.
type ConcreteStateB struct {
	context *Context
}
func (s *ConcreteStateB) HandleRequest() {
	fmt.Println("Handling request in ConcreteStateB.")
	s.context.SetState(&ConcreteStateA{context: s.context})
}
// Context maintains a reference to a State object and delegates requests to it.
type Context struct {
	state State
}
func (c *Context) SetState(state State) {
	c.state = state
}
func (c *Context) Request() {
	c.state.HandleRequest()
}
func main() {
	context := &Context{}
	stateA := &ConcreteStateA{context: context}
	context.SetState(stateA)
	
	// Initial request
	context.Request()
	
	// State change
	context.Request()
}
`
