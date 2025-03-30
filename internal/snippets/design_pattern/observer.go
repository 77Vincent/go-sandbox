package design_pattern

const Observer = `package main

import "fmt"

// Observer defines the interface for objects that should be notified.
type Observer interface {
	Update(message string)
}

// Subject maintains a list of observers and notifies them.
type Subject struct {
	observers []Observer
}

// Register adds an observer to the subject.
func (s *Subject) Register(o Observer) {
	s.observers = append(s.observers, o)
}

// Notify sends a message to all registered observers.
func (s *Subject) Notify(message string) {
	for _, observer := range s.observers {
		observer.Update(message)
	}
}

// ConcreteObserver is a simple observer that prints received messages.
type ConcreteObserver struct {
	name string
}

// Update is called by the subject when notifying observers.
func (o ConcreteObserver) Update(message string) {
	fmt.Printf("%s received: %s\n", o.name, message)
}

func main() {
	subject := &Subject{}

	observerA := ConcreteObserver{name: "Observer A"}
	observerB := ConcreteObserver{name: "Observer B"}

	// Register observers with the subject.
	subject.Register(observerA)
	subject.Register(observerB)

	// Notify all observers.
	subject.Notify("Hello Observers!")
}`
