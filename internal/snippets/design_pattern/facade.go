package design_pattern

const Facade = `// Facade pattern let you create a simplified interface for a complex system that includes multiple subsystems.
package main

import "fmt"

// CPU subsystem
type CPU struct{}

func (c *CPU) Freeze() {
	fmt.Println("CPU: Freezing processor.")
}

func (c *CPU) Jump(position int) {
	fmt.Printf("CPU: Jumping to position %d.\n", position)
}

func (c *CPU) Execute() {
	fmt.Println("CPU: Executing instructions.")
}

// Memory subsystem
type Memory struct{}

func (m *Memory) Load(position int, data []byte) {
	fmt.Printf("Memory: Loading data into memory at position %d.\n", position)
}

// HardDrive subsystem
type HardDrive struct{}

func (h *HardDrive) Read(lba, size int) []byte {
	fmt.Printf("HardDrive: Reading %d bytes from sector %d.\n", size, lba)
	return []byte("boot data")
}

// Facade that simplifies interaction with subsystems
type ComputerFacade struct {
	cpu    *CPU
	memory *Memory
	hd     *HardDrive
}

func NewComputerFacade() *ComputerFacade {
	return &ComputerFacade{
		cpu:    &CPU{},
		memory: &Memory{},
		hd:     &HardDrive{},
	}
}

// Start encapsulates the complex boot-up process.
func (c *ComputerFacade) Start() {
	c.cpu.Freeze()
	data := c.hd.Read(0, 1024)
	c.memory.Load(0, data)
	c.cpu.Jump(0)
	c.cpu.Execute()
}

func main() {
	computer := NewComputerFacade()
	computer.Start()
}`
