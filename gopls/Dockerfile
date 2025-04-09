FROM golang:1.24-alpine

RUN go install golang.org/x/tools/gopls@latest

## Create the workspace directory
WORKDIR /workspace

# Expose the port gopls will listen on
EXPOSE 4389

# Start gopls as a TCP LSP server with logging
CMD ["gopls", "-rpc.trace", "-logfile=/tmp/gopls.log", "-listen=:4389"]
