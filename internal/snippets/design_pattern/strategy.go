package design_pattern

const Strategy = `package main

import "fmt"

type Strategy interface {
    Execute(a, b int) int
}

type AddStrategy struct{}

func (s AddStrategy) Execute(a, b int) int {
    return a + b
}

type SubtractStrategy struct{}

func (s SubtractStrategy) Execute(a, b int) int {
    return a - b
}

type Context struct {
    strategy Strategy
}

func (c *Context) SetStrategy(strategy Strategy) {
    c.strategy = strategy
}

func (c Context) DoOperation(a, b int) int {
    return c.strategy.Execute(a, b)
}

func main() {
    context := Context{}
    
    context.SetStrategy(AddStrategy{})
    fmt.Println("Addition:", context.DoOperation(3, 4))
    
    context.SetStrategy(SubtractStrategy{})
    fmt.Println("Subtraction:", context.DoOperation(3, 4))
}`
