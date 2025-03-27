package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/tianqi-wen_frgr/go-sandbox/internal/snippets"
	"github.com/tianqi-wen_frgr/go-sandbox/internal/snippets/design_pattern"
	"net/http"
)

const (
	notFoundError = "template not found"
	// basic
	helloWorld        = "helloWorld"
	sleepCase         = "sleep"
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
	mergeSortCase    = "mergeSort"
	binarySearchCase = "binarySearch"
	bfsCase          = "bfs"
	dfsCase          = "dfs"
	// fun
	clearScreenCase = "clearScreen"
	httpServerCase  = "httpServer"
	gameOfLifeCase  = "gameOfLife"
	// design patterns
	singletonCase = "singleton"
	factoryCase   = "factory"
	strategyCase  = "strategy"
	prototypeCase = "prototype"
	decoratorCase = "decorator"
)

func GetTemplate(c *gin.Context) {
	var (
		id     = c.Param("id")
		output = ""
	)
	switch id {
	case helloWorld:
		output = snippets.HelloSandbox
	case sleepCase:
		output = snippets.Sleep
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
	case fileIOCase:
		output = snippets.FileIO
	case contextCancelCase:
		output = snippets.ContextCancel
	case jsonCase:
		output = snippets.JSON
	case mutexCase:
		output = snippets.Mutex
	case tickerCase:
		output = snippets.Ticker

	// problems
	case fibonacciCase:
		output = snippets.Fibonacci
	case quickSortCase:
		output = snippets.QuickSort
	case mergeSortCase:
		output = snippets.MergeSort
	case binarySearchCase:
		output = snippets.BinarySearch
	case bfsCase:
		output = snippets.Bfs
	case dfsCase:
		output = snippets.Dfs

	// fun
	case clearScreenCase:
		output = snippets.ClearScreen
	case httpServerCase:
		output = snippets.HttpServer
	case gameOfLifeCase:
		output = snippets.GameOfLife

	// design patterns
	case singletonCase:
		output = design_pattern.Singleton
	case factoryCase:
		output = design_pattern.Factory
	case strategyCase:
		output = design_pattern.Strategy
	case prototypeCase:
		output = design_pattern.Prototype
	case decoratorCase:
		output = design_pattern.Decorator

	default:
		c.String(http.StatusNotFound, notFoundError)
	}

	c.String(http.StatusOK, output)
}
