package design_pattern

const TemplatePattern = `package main

import "fmt"

type I interface {
	foo() string
	bar() string
}

// a default implementation of I
type template struct{}

func (t template) foo() string {
	return "template foo"
}
func (t template) bar() string {
	return "template bar"
}

// A alter the template, overwrites foo()
type A struct {
	template
}

func (a A) foo() string {
	return "foo"
}
func (a A) bar() string {
	return a.template.bar()
}

// B alter the template, overwrites bar()
type B struct {
	template
}

func (b B) foo() string {
	return b.template.foo()
}
func (b B) bar() string {
	return "bar"
}

func main() {
	t := template{}
	a := A{}
	b := B{}

	fmt.Println("t's foo: ", t.foo())
	fmt.Println("t's bar: ", t.bar())

	fmt.Println("================")

	fmt.Println("a's foo: ", a.foo())
	fmt.Println("a's bar: ", a.bar())

	fmt.Println("================")

	fmt.Println("b's foo: ", b.foo())
	fmt.Println("b's bar: ", b.bar())
}`
