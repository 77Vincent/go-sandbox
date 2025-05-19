package design_pattern

const Iterator = `// Iterator Pattern is a behavioral design pattern that provides a way to access the elements of an aggregate object sequentially without exposing its underlying representation.
package main
import "fmt"
// Iterator interface defines the methods for iterating over a collection.
type Iterator interface {
	Next() interface{}
	HasNext() bool
}
// ConcreteIterator is a concrete implementation of the Iterator interface.
type ConcreteIterator struct {
	collection *ConcreteCollection
	current    int
}
func (i *ConcreteIterator) Next() interface{} {
	if i.HasNext() {
		item := i.collection.items[i.current]
		i.current++
		return item
	}
	return nil
}
func (i *ConcreteIterator) HasNext() bool {
	return i.current < len(i.collection.items)
}
// Collection interface defines the method to create an iterator.
type Collection interface {
	CreateIterator() Iterator
}
// ConcreteCollection is a concrete implementation of the Collection interface.
type ConcreteCollection struct {
	items []interface{}
}
func (c *ConcreteCollection) CreateIterator() Iterator {
	return &ConcreteIterator{collection: c, current: 0}
}
func (c *ConcreteCollection) Add(item interface{}) {
	c.items = append(c.items, item)
}
func (c *ConcreteCollection) Remove(item interface{}) {
	c.items = append(c.items[:0], c.items[1:]...)
}
func main() {
	collection := &ConcreteCollection{}
	collection.Add("Item 1")
	collection.Add("Item 2")
	collection.Add("Item 3")

	iterator := collection.CreateIterator()
	for iterator.HasNext() {
		fmt.Println(iterator.Next())
	}
}`
