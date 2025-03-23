package snippets

const SwitchCase = `package main

import (
    "fmt"
)

func main() {
    // Example 1: Basic switch-case with an integer
    number := 3
    fmt.Println("Example 1: Basic switch-case with an integer:")
    switch number {
    case 1:
        fmt.Println("Number is one")
    case 2:
        fmt.Println("Number is two")
    case 3:
        fmt.Println("Number is three")
    default:
        fmt.Println("Unknown number")
    }
    fmt.Println()

    // Example 2: Switch with multiple expressions in one case
    day := "Sat"
    fmt.Println("Example 2: Switch with multiple expressions in one case:")
    switch day {
    case "Sat", "Sun":
        fmt.Println("It's the weekend")
    default:
        fmt.Println("It's a weekday")
    }
    fmt.Println()

    // Example 3: Switch without an expression (similar to if-else)
    score := 85
    fmt.Println("Example 3: Switch without an expression (if-else chain):")
    switch {
    case score >= 90:
        fmt.Println("Grade: A")
    case score >= 80:
        fmt.Println("Grade: B")
    case score >= 70:
        fmt.Println("Grade: C")
    case score >= 60:
        fmt.Println("Grade: D")
    default:
        fmt.Println("Grade: F")
    }
    fmt.Println()

    // Example 4: Using fallthrough to execute subsequent case blocks
    level := 1
    fmt.Println("Example 4: Switch-case with fallthrough:")
    switch level {
    case 1:
        fmt.Println("Level 1: Beginner")
        fallthrough // fallthrough continues to the next case regardless of its condition
    case 2:
        fmt.Println("Level 2: Intermediate")
        fallthrough
    case 3:
        fmt.Println("Level 3: Advanced")
    default:
        fmt.Println("Other level")
    }
    fmt.Println()

    // Example 5: Type switch to determine the underlying type of an interface value
    var value interface{} = 3.14
    fmt.Println("Example 5: Type switch to determine variable type:")
    switch v := value.(type) {
    case int:
        fmt.Printf("Type is int, value: %d\n", v)
    case float64:
        fmt.Printf("Type is float64, value: %f\n", v)
    case string:
        fmt.Printf("Type is string, value: %s\n", v)
    default:
        fmt.Println("Unknown type")
    }
}`
