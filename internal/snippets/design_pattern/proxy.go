package design_pattern

const Proxy = `// Proxy Pattern is a structural design pattern that provides an object representing another object.
package main

import "fmt"

// Subject is the interface both RealSubject and Proxy implement.
type Subject interface {
	Request()
}

// RealSubject is the actual object that does the real work.
type RealSubject struct{}

func (RealSubject) Request() {
	fmt.Println("RealSubject: Handling request.")
}

// Proxy controls access to the RealSubject, adding extra behavior.
type Proxy struct {
	real *RealSubject
}

func (p Proxy) Request() {
	fmt.Println("Proxy: Logging before calling real subject.")
	p.real.Request()
	fmt.Println("Proxy: Logging after calling real subject.")
}

func main() {
	real := &RealSubject{}
	proxy := Proxy{real: real}
	proxy.Request()
}`
