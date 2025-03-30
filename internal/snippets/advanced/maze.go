package advanced

const Maze = `// Maze generation using recursive backtracking in Go
package main

import (
	"fmt"
	"math/rand"
	"time"
)

const (
	width  = 9 // Maze width in cells
	height = 9 // Maze height in cells
)

// Cell represents one cell in the maze.
type Cell struct {
	top, right, bottom, left bool // true means the wall exists
	visited                  bool
}

// Maze holds the grid of cells.
type Maze struct {
	grid [][]Cell
}

// NewMaze creates and initializes a maze with all walls intact.
func NewMaze(w, h int) *Maze {
	grid := make([][]Cell, h)
	for y := 0; y < h; y++ {
		grid[y] = make([]Cell, w)
		for x := 0; x < w; x++ {
			grid[y][x] = Cell{top: true, right: true, bottom: true, left: true}
		}
	}
	return &Maze{grid: grid}
}

// Direction offsets for top, right, bottom, and left.
var directions = []struct{ dx, dy int }{
	{0, -1}, // top
	{1, 0},  // right
	{0, 1},  // bottom
	{-1, 0}, // left
}

// removeWall removes the wall between cell (x, y) and its neighbor (nx, ny).
func (m *Maze) removeWall(x, y, nx, ny int) {
	if nx == x && ny == y-1 { // Neighbor is above.
		m.grid[y][x].top = false
		m.grid[ny][nx].bottom = false
	} else if nx == x+1 && ny == y { // Right neighbor.
		m.grid[y][x].right = false
		m.grid[ny][nx].left = false
	} else if nx == x && ny == y+1 { // Neighbor is below.
		m.grid[y][x].bottom = false
		m.grid[ny][nx].top = false
	} else if nx == x-1 && ny == y { // Left neighbor.
		m.grid[y][x].left = false
		m.grid[ny][nx].right = false
	}
}

// inBounds checks if the (x, y) coordinate is within the maze.
func (m *Maze) inBounds(x, y int) bool {
	return x >= 0 && x < width && y >= 0 && y < height
}

// generate uses recursive backtracking to carve out the maze.
func (m *Maze) generate(x, y int) {
	m.grid[y][x].visited = true

	// Randomize directions to ensure varied maze generation.
	dirs := rand.Perm(4)
	for _, d := range dirs {
		nx := x + directions[d].dx
		ny := y + directions[d].dy
		if m.inBounds(nx, ny) && !m.grid[ny][nx].visited {
			m.removeWall(x, y, nx, ny)
			m.generate(nx, ny)
		}
	}
}

// printMaze prints the maze to the console using ASCII characters.
func (m *Maze) printMaze() {
	// Print the top border.
	for i := 0; i < width; i++ {
		fmt.Print(" _")
	}
	fmt.Println()
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			// Print the left wall of the cell.
			if m.grid[y][x].left {
				fmt.Print("|")
			} else {
				fmt.Print(" ")
			}
			// Print the bottom wall.
			if m.grid[y][x].bottom {
				fmt.Print("_")
			} else {
				fmt.Print(" ")
			}
		}
		fmt.Println("|")
	}
}

func main() {
	rand.Seed(time.Now().UnixNano())
	maze := NewMaze(width, height)
	maze.generate(0, 0)
	maze.printMaze()
}`
