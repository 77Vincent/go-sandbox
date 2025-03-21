package config

const (
	APIGlobalTimeout    = 10                     // seconds
	SandboxCPUTimeLimit = 5                      // seconds
	SandboxMemoryLimit  = 2 * 1024 * 1024 * 1024 // bytes
	BaseUrl             = "https://go-sandbox.org"
	CodeSnippetTTL      = 14 * 24 // hours
)
