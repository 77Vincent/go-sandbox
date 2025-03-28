package design_pattern

const Adaptor = `// Adaptor is a structural design pattern that allows objects with incompatible interfaces to collaborate.
package main

import "fmt"

// Target defines the interface that clients expect.
type Target interface {
	Request()
}

// Adaptee is a class with an incompatible interface.
type Adaptee struct{}

func (Adaptee) SpecificRequest() {
	fmt.Println("Adaptee: Handling specific request.")
}

// Adapter adapts the interface of Adaptee to the Target interface.
type Adapter struct {
	adaptee *Adaptee
}

func (a Adapter) Request() {
	// The adapter delegates the call to the adaptee's SpecificRequest.
	a.adaptee.SpecificRequest()
}

func main() {
	adaptee := &Adaptee{}
	// Wrap the adaptee with an adapter so it matches the Target interface.
	var target Target = Adapter{adaptee: adaptee}
	
	// The client only knows about the Target interface.
	target.Request()
}`
