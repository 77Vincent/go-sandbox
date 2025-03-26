package snippets

const Singleton = `package main

import (
	"fmt"
	"sync"
	"time"
)

type Singleton struct {
	Data string
}

var instance *Singleton
var once sync.Once

// GetInstance returns the single instance of Singleton.
func GetInstance() *Singleton {
	once.Do(func() {
		instance = &Singleton{Data: time.Now().String()}
	})
	return instance
}

func main() {
	s1 := GetInstance()
	s2 := GetInstance()
	fmt.Println("s1:", s1.Data)
	fmt.Println("s2:", s2.Data)
	fmt.Println("Same instance?", s1 == s2)
}`
