package design_pattern

const Command = `// Command Pattern is a behavioral design pattern that encapsulates a request as an object, thereby allowing for parameterization of clients with queues, requests, and operations.
package main

import "fmt"

// Command interface defines the command interface.
type Command interface {
	Execute()
}
// Light is a receiver that will perform the action.
type Light struct{}
func (l *Light) TurnOn() {
	fmt.Println("Light is ON")
}
func (l *Light) TurnOff() {
	fmt.Println("Light is OFF")
}
// LightOnCommand is a concrete command that turns the light on.
type LightOnCommand struct {
	light *Light
}
func (c *LightOnCommand) Execute() {
	c.light.TurnOn()
}
// LightOffCommand is a concrete command that turns the light off.
type LightOffCommand struct {
	light *Light
}
func (c *LightOffCommand) Execute() {
	c.light.TurnOff()
}
// RemoteControl is the invoker that will call the command.
type RemoteControl struct {
	onCommand  Command
	offCommand Command
}
func (r *RemoteControl) PressOn() {
	r.onCommand.Execute()
}
func (r *RemoteControl) PressOff() {
	r.offCommand.Execute()
}
func main() {
	light := &Light{}
	lightOn := &LightOnCommand{light: light}
	lightOff := &LightOffCommand{light: light}

	remote := &RemoteControl{
		onCommand:  lightOn,
		offCommand: lightOff,
	}

	remote.PressOn()
	remote.PressOff()
}`
