package internal

// env keys
const (
	EnvKey       = "GIN_MODE"
	AwsRegionKey = "AWS_REGION"
)

const (
	WorkspacePath       = "/app/sandboxes"
	APIGlobalTimeout    = 10 // seconds
	SandboxCPUTimeLimit = 7  // seconds
	CodeSnippetBucket   = "go-sandbox-snippets"
	ApiServerPort       = ":3000"
	LocalStackEndpoint  = "http://localstack:4566"
	DefaultRegion       = "ap-northeast-1"
	ProdModeValue       = "release"
)
