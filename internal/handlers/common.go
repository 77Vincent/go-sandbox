package handlers

const (
	badRequestMessage = "bad request"
	buildErrorMessage = "build failed"
)

type request struct {
	Code    string `json:"code" binding:"required"`
	Version string `json:"version"`
}

type response struct {
	Stderr  string `json:"stderr"`
	Stdout  string `json:"stdout"`
	Error   string `json:"error"`
	Message string `json:"message"`
}
