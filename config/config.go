package config

const (
	WorkspacePath       = "/app"
	APIGlobalTimeout    = 10      // seconds
	SandboxCPUTimeLimit = 7       // seconds
	CodeSnippetTTL      = 14 * 24 // hours
	RedisUrl            = "redis:6379"
	ApiServerPort       = ":3000"
)
