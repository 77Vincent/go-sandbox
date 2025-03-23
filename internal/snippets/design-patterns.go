package snippets

const Factory = `package main

import "fmt"

// type A, B, C all implement I
type I interface {}

func factory(string t) I {
  switch t {
    case "A":
      return new A()
    case "B":
      return new B()
    case "C":
      return new C()
  }
}

func main() {
  a := factory("A")
  b := factory("B")
  c := factory("C")

  fmt.Println(a, b, c)
}`
