package design_pattern

const Strategy = `// Strategy pattern lets the context to choose a certain strategy
// from a few ones that all implement the same interface
package main

import "fmt"

type I interface {
	do()
}

type A struct{}
type B struct{}
type C struct{}

func (a A) do() {
	fmt.Println("a")
}
func (b B) do() {
	fmt.Println("b")
}
func (c C) do() {
	fmt.Println("c")
}

func main() {
	var (
		executor I
		strategy = "B"
	)

	switch strategy {
	case "A":
		executor = new(A)
	case "B":
		executor = new(B)
	case "C":
		executor = new(C)
	}

	executor.do()
}`
