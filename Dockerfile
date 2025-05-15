FROM golang:1.24-alpine AS build-runner-1

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

#FROM golang:tip-alpine AS build-runner-4
#
#ENV CGO_ENABLED=1
#ENV GOOS=linux
#ENV GOARCH=arm64
#
#RUN apk update && apk add --no-cache pkgconfig libseccomp-dev gcc musl-dev
#
#WORKDIR /go/src/app
#COPY sandbox/go.mod sandbox/go.sum ./
#RUN go mod download
#COPY sandbox .
#
#RUN go build -o sandbox-runner .

FROM golang:1.24-alpine AS build-backend

# 设置 CGO_ENABLED=1，以支持 seccomp
ENV CGO_ENABLED=1
ENV GOOS=linux
ENV GOARCH=arm64

RUN apk update && apk add --no-cache pkgconfig libseccomp-dev gcc musl-dev

WORKDIR /go/src/app

# 拷贝 go.mod 和 go.sum（如果有）并下载依赖
COPY go.mod go.sum ./
RUN go mod download && go mod tidy

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

# 创建沙箱目录
RUN mkdir -p /app/sandboxes/go1
RUN mkdir -p /app/sandboxes/go2
#RUN mkdir -p /app/sandboxes/go4

# copy the backend server
COPY --from=build-backend /go/src/app/server ./

# Copy the sandbox runner from each runner stage into separate directories
COPY --from=build-runner-1 /go/src/app/sandbox-runner /app/sandboxes/go1
COPY --from=build-runner-2 /go/src/app/sandbox-runner /app/sandboxes/go2
#COPY --from=build-runner-4 /go/src/app/sandbox-runner /app/sandboxes/go4

# Copy the go toolchain from each runner stage into separate directories
COPY --from=build-runner-1 /usr/local/go /go1
COPY --from=build-runner-2 /usr/local/go /go2
#COPY --from=build-runner-4 /usr/local/go /go4

ENV PATH="/go1/bin:${PATH}"

EXPOSE 3000

# 启动可执行文件
CMD ["./server"]
