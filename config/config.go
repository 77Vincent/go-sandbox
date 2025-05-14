package config

// env keys
const (
	// EnvLocalStackEndpoint is the environment variable for a localstack endpoint
	EnvLocalStackEndpoint = "LOCALSTACK_ENDPOINT"
)

const (
	WorkspacePath       = "/app/sandboxes"
	APIGlobalTimeout    = 10 // seconds
	SandboxCPUTimeLimit = 7  // seconds
	CodeSnippetBucket   = "go-sandbox-snippets"
	RealS3Endpoint      = "https://s3.ap-northeast-1.amazonaws.com"
	ApiServerPort       = ":3000"
)
