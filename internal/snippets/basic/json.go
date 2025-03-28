package basic

const JSON = `package main

import (
    "encoding/json"
    "fmt"
)

type Person struct {
    Name string ` + "`json:\"name\"`" + `
    Age  int    ` + "`json:\"age\"`" + `
}

func main() {
    person := Person{Name: "Alice", Age: 30}

    // Marshal the struct to JSON.
    data, err := json.Marshal(person)
    if err != nil {
        fmt.Println("Error marshalling JSON:", err)
        return
    }
    fmt.Println("JSON:", string(data))

    // Unmarshal JSON back into a struct.
    var person2 Person
    err = json.Unmarshal(data, &person2)
    if err != nil {
        fmt.Println("Error unmarshalling JSON:", err)
        return
    }
    fmt.Printf("Unmarshalled: %+v\n", person2)
}`
