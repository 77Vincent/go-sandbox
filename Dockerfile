FROM golang:1.23.4-alpine AS build-backend

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

# 工作目录
WORKDIR /app

# 拷贝后端可执行文件
COPY --from=build-backend /go/src/app/server ./

# 暴露端口（看你 gin 监听哪个端口，这里假设 8080）
EXPOSE 8080

# 启动可执行文件
CMD ["./server"]
