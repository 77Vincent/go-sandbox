package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/tianqi-wen_frgr/go-sandbox/internal/snippets/advanced"
	"github.com/tianqi-wen_frgr/go-sandbox/internal/snippets/basic"
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
	// advanced
	mazeCase              = "maze"
	fibonacciCase         = "fibonacci"
	progressBarCase       = "progressBar"
	quickSortCase         = "quickSort"
	mergeSortCase         = "mergeSort"
	binarySearchCase      = "binarySearch"
	bfsCase               = "bfs"
	dfsCase               = "dfs"
	lruCase               = "lru"
	lcsCase               = "lcs"
	spinner               = "spinner"
	httpServerCase        = "httpServer"
	gameOfLifeCase        = "gameOfLife"
	concurrentPrimeCase   = "concurrentPrime"
	diningPhilosopherCase = "diningPhilosophers"
	sudokuCase            = "sudoku"
	// design patterns
	singletonCase = "singleton"
	factoryCase   = "factory"
	strategyCase  = "strategy"
	prototypeCase = "prototype"
	decoratorCase = "decorator"
	templateCase  = "template"
	facadeCase    = "facade"
	adaptorCase   = "adaptor"
	observerCase  = "observer"
	bridgeCase    = "bridge"
	proxyCase     = "proxy"
	compositeCase = "composite"
	commandCase   = "command"
	stateCase     = "state"
	iteratorCase  = "iterator"
	visitorCase   = "visitor"
)

func GetTemplate(c *gin.Context) {
	var (
		id     = c.Param("id")
		output = ""
	)
	switch id {
	case helloWorld:
		output = basic.HelloSandbox
	case sleepCase:
		output = basic.Sleep
	case switchCaseCase:
		output = basic.SwitchCase
	case goroutineCase:
		output = basic.Goroutine
	case channelCase:
		output = basic.Channel
	case deferCase:
		output = basic.Defer
	case assertionCase:
		output = basic.Assertion
	case fileIOCase:
		output = basic.FileIO
	case contextCancelCase:
		output = basic.ContextCancel
	case jsonCase:
		output = basic.JSON
	case mutexCase:
		output = basic.Mutex
	case tickerCase:
		output = basic.Ticker

	// advanced
	case mazeCase:
		output = advanced.Maze
	case spinner:
		output = advanced.Spinner
	case progressBarCase:
		output = advanced.ProgressBar
	case httpServerCase:
		output = advanced.HttpServer
	case gameOfLifeCase:
		output = advanced.GameOfLife
	case concurrentPrimeCase:
		output = advanced.ConcurrentPrime
	case diningPhilosopherCase:
		output = advanced.DiningPhilosopher
	case fibonacciCase:
		output = advanced.Fibonacci
	case quickSortCase:
		output = advanced.QuickSort
	case mergeSortCase:
		output = advanced.MergeSort
	case binarySearchCase:
		output = advanced.BinarySearch
	case bfsCase:
		output = advanced.Bfs
	case dfsCase:
		output = advanced.Dfs
	case lruCase:
		output = advanced.LRU
	case lcsCase:
		output = advanced.LCS
	case sudokuCase:
		output = advanced.Sudoku

	// design patterns
	case observerCase:
		output = design_pattern.Observer
	case bridgeCase:
		output = design_pattern.Bridge
	case proxyCase:
		output = design_pattern.Proxy
	case compositeCase:
		output = design_pattern.Composite
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
	case templateCase:
		output = design_pattern.TemplatePattern
	case facadeCase:
		output = design_pattern.Facade
	case adaptorCase:
		output = design_pattern.Adaptor
	case commandCase:
		output = design_pattern.Command
	case stateCase:
		output = design_pattern.State
	case iteratorCase:
		output = design_pattern.Iterator
	case visitorCase:
		output = design_pattern.Visitor

	default:
		c.String(http.StatusNotFound, notFoundError)
	}

	c.String(http.StatusOK, output)
}
