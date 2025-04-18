package config

const (
	WorkspacePath       = "/app/sandboxes"
	APIGlobalTimeout    = 10      // seconds
	SandboxCPUTimeLimit = 7       // seconds
	CodeSnippetTTL      = 30 * 24 // hours
	RedisUrl            = "redis:6379"
	ApiServerPort       = ":3000"
)
