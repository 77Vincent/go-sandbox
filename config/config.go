package config

const (
	APIGlobalTimeout    = 10                     // seconds
	SandboxCPUTimeLimit = 5                      // seconds
	SandboxMemoryLimit  = 2 * 1024 * 1024 * 1024 // bytes
	CodeSnippetTTL      = 14 * 24                // hours
	RedisLocalUrl       = "redis:6379"
	RedisEnvKey         = "REDIS_URL"
)
