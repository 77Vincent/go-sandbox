# ---- Build sandbox-runner with Go 1.19 ----
FROM golang:1.23-alpine AS build-runner-1

ENV CGO_ENABLED=1
ENV GOOS=linux
ENV GOARCH=arm64

# 更新 apk 并安装必要依赖：pkgconfig、libseccomp-dev、gcc、musl-dev
RUN apk update && apk add --no-cache \
    pkgconfig \
    libseccomp-dev \
    gcc \
    musl-dev

WORKDIR /go/src/app
COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN go build -o sandbox-runner-1 ./sandbox/main.go

# ---- Build sandbox-runner with Go 1.24 ----
FROM golang:1.24-alpine AS build-runner-2

ENV CGO_ENABLED=1
ENV GOOS=linux
ENV GOARCH=arm64

# 更新 apk 并安装必要依赖：pkgconfig、libseccomp-dev、gcc、musl-dev
RUN apk update && apk add --no-cache \
    pkgconfig \
    libseccomp-dev \
    gcc \
    musl-dev

WORKDIR /go/src/app
COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN go build -o sandbox-runner-2 ./sandbox/main.go

FROM golang:1.24-alpine AS build-backend

# 设置 CGO_ENABLED=1，以支持 seccomp
ENV CGO_ENABLED=1
ENV GOOS=linux
ENV GOARCH=arm64

# 更新 apk 并安装必要依赖：pkgconfig、libseccomp-dev、gcc、musl-dev
RUN apk update && apk add --no-cache \
    pkgconfig \
    libseccomp-dev \
    gcc \
    musl-dev

WORKDIR /go/src/app

# 拷贝 go.mod 和 go.sum（如果有）并下载依赖
COPY go.mod go.sum ./
RUN go mod download

# 拷贝项目其余所有源码（包括 main.go、internal/ 等）
COPY . .

# 编译生成可执行文件
RUN go build -o server main.go

# =========== 3. 最终镜像阶段 =============
FROM alpine:3.16

# 运行时只需 libseccomp
RUN apk add --no-cache libseccomp

# 工作目录
WORKDIR /app

# 拷贝后端可执行文件
COPY --from=build-backend /go/src/app/server ./
COPY --from=build-runner-1 /go/src/app/sandbox-runner-1 ./
COPY --from=build-runner-2 /go/src/app/sandbox-runner-2 ./

# 从构建镜像拷贝 go 工具链
COPY --from=build-backend /usr/local/go /usr/local/go

# 更新 PATH，让 /app 和 go 工具链在 PATH 中
ENV PATH="/app:/usr/local/go/bin:${PATH}"

EXPOSE 3000

# 启动可执行文件
CMD ["./server"]
