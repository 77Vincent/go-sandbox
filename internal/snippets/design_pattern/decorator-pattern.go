package design_pattern

const Decorator = `# A decorates B to produce variation without mutating A's original behavior
package main

import "fmt"

type I interface {
	do() int
}

type A struct{}

func (a A) do() int {
	return 1
}

type B struct {
	i I
}

func (b B) do() int {
	return b.i.do() + 1
}

func main() {
	a := A{}
	b := B{
		i: a,
	}

	fmt.Println("a - original value:  ", a.do())
	fmt.Println("b - decorated value: ", b.do())
}`
