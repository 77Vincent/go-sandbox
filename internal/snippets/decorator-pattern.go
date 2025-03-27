package snippets

const Decorator = `package main

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
