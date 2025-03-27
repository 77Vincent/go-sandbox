package design_pattern

const Strategy = `// Strategy pattern lets the context to choose a certain strategy
// from a few ones that all implement the same interface
package main

import "fmt"

type I interface {
	do() string
}

type A struct{}
type B struct{}
type C struct{}

func (a A) do() string {
	return "a"
}
func (b B) do() string {
	return "b"
}
func (c C) do() string {
	return "c"
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

	fmt.Println("Strategy:", executor.do())
}`
