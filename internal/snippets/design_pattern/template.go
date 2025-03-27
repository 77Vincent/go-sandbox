package design_pattern

const TemplatePattern = `type interface I {
  foo()
  bar()
}

// a default implementation of I
type template struct {}
func (t template) foo() {}
func (t template) bar() {}

// only overwrites foo
type A struct {
  template
}
func (a A) foo() {
  fmt.Print("a foo")
}
func (a A) bar() {
  a.template.bar()
}

// only overwrites bar
type B struct {
  template
}
func (b B) foo() {
  b.template.foo()
}
func (b B) bar() {
  fmt.Print("b bar")
}`
