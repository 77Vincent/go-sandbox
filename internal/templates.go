package internal

import (
	"github.com/gin-gonic/gin"
	"github.com/tianqi-wen_frgr/best-go-playground/internal/snippets"
	"net/http"
)

const (
	notFoundError = "template not found"
	// basic
	sleepCase         = "sleep"
	httpServerCase    = "httpServer"
	switchCaseCase    = "switchCase"
	goroutineCase     = "goroutine"
	channelCase       = "channel"
	deferCase         = "defer"
	assertionCase     = "assertion"
	fileIOCase        = "fileIO"
	contextCancelCase = "contextCancel"
	jsonCase          = "json"
	mutexCase         = "mutex"
	tickerCase        = "ticker"
	// problems
	fibonacciCase    = "fibonacci"
	quickSortCase    = "quickSort"
	binarySearchCase = "binarySearch"
	bfsCase          = "bfs"
	// fun
	clearScreenCase = "clearScreen"
)

func GetTemplate(c *gin.Context) {
	var (
		id     = c.Param("id")
		output = ""
	)
	switch id {
	case sleepCase:
		output = snippets.Sleep
	case httpServerCase:
		output = snippets.HttpServer
	case switchCaseCase:
		output = snippets.SwitchCase
	case goroutineCase:
		output = snippets.Goroutine
	case channelCase:
		output = snippets.Channel
	case deferCase:
		output = snippets.Defer
	case assertionCase:
		output = snippets.Assertion
	case clearScreenCase:
		output = snippets.ClearScreen
	case fileIOCase:
		output = snippets.FileIO
	case contextCancelCase:
		output = snippets.ContextCancel
	case jsonCase:
		output = snippets.JSON
	case fibonacciCase:
		output = snippets.Fibonacci
	case mutexCase:
		output = snippets.Mutex
	case tickerCase:
		output = snippets.Ticker
	case quickSortCase:
		output = snippets.QuickSort
	case binarySearchCase:
		output = snippets.BinarySearch
	case bfsCase:
		output = snippets.Bfs
	default:
		c.String(http.StatusNotFound, notFoundError)
	}

	c.String(http.StatusOK, output)
}
