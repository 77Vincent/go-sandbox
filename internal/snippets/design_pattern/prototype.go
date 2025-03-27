package design_pattern

const Prototype = `package main

import "fmt"

type I interface {
	change(name string)
	clone() I
}

type A struct {
	name string
}

func (a *A) change(name string) {
	a.name = name
}

func (a *A) clone() I {
	tmp := *a
	return &tmp
}

func main() {
	var a, b I
	a = &A{
		name: "foo",
	}
	b = a.clone()
	fmt.Println(a, b)

	b.change("bar")
	fmt.Println(a, b)
}`
