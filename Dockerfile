FROM golang:1.24.3-alpine AS build-runner

ENV CGO_ENABLED=1
ENV GOOS=linux
ENV GOARCH=arm64

RUN apk update && apk add --no-cache pkgconfig libseccomp-dev gcc musl-dev

WORKDIR /go/src/app
COPY sandbox/go.mod sandbox/go.sum ./
RUN go mod download
COPY sandbox .

RUN go build -o sandbox-runner .

FROM golang:1.24.3-alpine AS build-backend

# enable CGO_ENABLED=1 to support seccomp
ENV CGO_ENABLED=1
ENV GOOS=linux
ENV GOARCH=arm64

RUN apk update && apk add --no-cache pkgconfig libseccomp-dev gcc musl-dev

WORKDIR /go/src/app

COPY go.mod go.sum ./
RUN go mod download && go mod tidy

# copy the rest of the project source code
COPY . .

# compile the backend server

# Install gopls (cached unless go.mod changes)
RUN go install golang.org/x/tools/gopls@latest

# Build the backend server
RUN go build -o server main.go

# =========== 3. final stage ===========
FROM alpine:3.16

# libseccomp is needed for seccomp support
RUN apk add --no-cache libseccomp

## create non-root user and group, own /app
RUN addgroup -S appgroup \
    && adduser -S appuser -G appgroup \
    && mkdir -p /app/sandboxes/go \
    && chown -R appuser:appgroup /app

## for sandbox temp files
RUN mkdir -p /app/sandbox-temp \
    && chown -R appuser:appgroup /app/sandbox-temp

WORKDIR /app

# copy the backend server
COPY --from=build-backend /go/src/app/server ./

# Copy gopls binary
COPY --from=build-backend /go/bin/gopls /usr/local/bin/gopls

# Copy the sandbox runner from the runner stage into the sandbox directory
COPY --from=build-runner /go/src/app/sandbox-runner /app/sandboxes/go

# Copy the go toolchain from the runner stage into the go directory
COPY --from=build-runner /usr/local/go /go
# Set the default PATH to include all Go toolchains
ENV PATH="/go/bin:${PATH}"

# Entrypoint script to run both server and gopls
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# switch to non-root user
USER appuser

EXPOSE 3000

# Expose gopls port
EXPOSE 4389

CMD ["/app/entrypoint.sh"]
