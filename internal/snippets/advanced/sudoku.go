package advanced

const Sudoku = `package main

import (
	"fmt"
	"math/rand"
	"time"
)

const N = 9

type Board [N][N]int

// isSafe checks if placing num at board[row][col] is valid.
func isSafe(board *Board, row, col, num int) bool {
	// Check row and column.
	for x := 0; x < N; x++ {
		if board[row][x] == num || board[x][col] == num {
			return false
		}
	}
	// Check the 3x3 sub-grid.
	startRow, startCol := row-row%3, col-col%3
	for i := 0; i < 3; i++ {
		for j := 0; j < 3; j++ {
			if board[startRow+i][startCol+j] == num {
				return false
			}
		}
	}
	return true
}

// solve fills the board with a complete Sudoku solution using backtracking.
func solve(board *Board) bool {
	for row := 0; row < N; row++ {
		for col := 0; col < N; col++ {
			if board[row][col] == 0 {
				// Try numbers 1 to 9 in random order.
				nums := rand.Perm(N)
				for _, v := range nums {
					num := v + 1 // rand.Perm returns values 0..N-1.
					if isSafe(board, row, col, num) {
						board[row][col] = num
						if solve(board) {
							return true
						}
						board[row][col] = 0
					}
				}
				return false
			}
		}
	}
	return true
}

// removeCells removes 'count' cells from the board to create the puzzle.
func removeCells(board *Board, count int) {
	for i := 0; i < count; i++ {
		row := rand.Intn(N)
		col := rand.Intn(N)
		// If already empty, try again.
		for board[row][col] == 0 {
			row = rand.Intn(N)
			col = rand.Intn(N)
		}
		board[row][col] = 0
	}
}

// printBoard prints the Sudoku board; empty cells are represented by dots.
func printBoard(board *Board) {
	for i := 0; i < N; i++ {
		for j := 0; j < N; j++ {
			if board[i][j] == 0 {
				fmt.Print(". ")
			} else {
				fmt.Printf("%d ", board[i][j])
			}
		}
		fmt.Println()
	}
}

func main() {
	rand.Seed(time.Now().UnixNano())
	var board Board

	if solve(&board) {
		fmt.Println("Complete Sudoku solution:")
		printBoard(&board)

		// Remove 40 cells to generate a puzzle.
		removeCells(&board, 40)
		fmt.Println("\nGenerated Sudoku puzzle:")
		printBoard(&board)
	} else {
		fmt.Println("No solution exists.")
	}
}`
