FROM golang:1.24.3-alpine AS build-runner-1

ENV CGO_ENABLED=1
ENV GOOS=linux
ENV GOARCH=arm64

RUN apk update && apk add --no-cache pkgconfig libseccomp-dev gcc musl-dev

WORKDIR /go/src/app
COPY sandbox/go.mod sandbox/go.sum ./
RUN go mod download
COPY sandbox .

RUN go build -o sandbox-runner .

FROM golang:1.23-alpine AS build-runner-2

ENV CGO_ENABLED=1
ENV GOOS=linux
ENV GOARCH=arm64

RUN apk update && apk add --no-cache pkgconfig libseccomp-dev gcc musl-dev

WORKDIR /go/src/app
COPY sandbox/go.mod sandbox/go.sum ./
RUN go mod download
COPY sandbox .

RUN go build -o sandbox-runner .

FROM golang:tip-alpine AS build-runner-4

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
RUN go build -o server main.go

# =========== 3. final stage ===========
FROM alpine:3.16

# libseccomp is needed for seccomp support
RUN apk add --no-cache libseccomp

WORKDIR /app

# workdir for the sandbox runners
RUN mkdir -p /app/sandboxes/go1
RUN mkdir -p /app/sandboxes/go2
RUN mkdir -p /app/sandboxes/go4

# copy the backend server
COPY --from=build-backend /go/src/app/server ./

# Copy the sandbox runner from each runner stage into separate directories
COPY --from=build-runner-1 /go/src/app/sandbox-runner /app/sandboxes/go1
COPY --from=build-runner-2 /go/src/app/sandbox-runner /app/sandboxes/go2
COPY --from=build-runner-4 /go/src/app/sandbox-runner /app/sandboxes/go4

# Copy the go toolchain from each runner stage into separate directories
COPY --from=build-runner-1 /usr/local/go /go1
COPY --from=build-runner-2 /usr/local/go /go2
COPY --from=build-runner-4 /usr/local/go /go4

# Set the default PATH to include all Go toolchains
ENV PATH="/go1/bin:/go2/bin:/go4/bin:${PATH}"

# no need to create nobody
USER nobody:nobody

EXPOSE 3000

CMD ["./server"]
