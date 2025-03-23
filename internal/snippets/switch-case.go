package snippets

const SwitchCase = `package main

import "fmt"

func main() {
    // 1. Basic switch-case
    num := 3
    switch num {
    case 1:
        fmt.Println("One")
    case 2:
        fmt.Println("Two")
    case 3:
        fmt.Println("Three")
    default:
        fmt.Println("Unknown")
    }

    // 2. Multiple values in one case
    day := "Sat"
    switch day {
    case "Sat", "Sun":
        fmt.Println("Weekend")
    default:
        fmt.Println("Weekday")
    }

    // 3. Switch without an expression (if-else style)
    score := 85
    switch {
    case score >= 90:
        fmt.Println("Grade A")
    case score >= 80:
        fmt.Println("Grade B")
    case score >= 70:
        fmt.Println("Grade C")
    default:
        fmt.Println("Grade D or F")
    }

    // 4. Using fallthrough to execute subsequent cases
    level := 1
    switch level {
    case 1:
        fmt.Println("Beginner")
        fallthrough
    case 2:
        fmt.Println("Intermediate")
        fallthrough
    case 3:
        fmt.Println("Advanced")
    default:
        fmt.Println("Other")
    }

    // 5. Type switch to determine the underlying type
    var val interface{} = 3.14
    switch v := val.(type) {
    case int:
        fmt.Println("Type int:", v)
    case float64:
        fmt.Println("Type float64:", v)
    case string:
        fmt.Println("Type string:", v)
    default:
        fmt.Println("Unknown type")
    }
}`
