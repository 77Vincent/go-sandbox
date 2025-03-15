# =========== 1. 前端构建阶段 =============
FROM node:16-alpine AS build-frontend

# 切换到 /app 目录
WORKDIR /app

# 拷贝前端项目 package.json、package-lock.json（或 yarn.lock）等依赖声明文件
COPY client/package*.json ./
# 如果你用的是 yarn，可以换成 yarn.lock
# COPY client/yarn.lock ./

# 安装依赖
RUN npm install

# 拷贝前端所有源码到工作目录（含 src、public、tsconfig、vite.config 等）
COPY client/ .

# 运行前端构建
RUN npm run build

# =========== 2. 后端构建阶段 =============
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

# 拷贝前端编译后文件（默认 Vite 会在 dist 目录产出）
COPY --from=build-frontend /app/dist ./client/dist

# 暴露端口（看你 gin 监听哪个端口，这里假设 8080）
EXPOSE 8080

# 启动可执行文件
CMD ["./server"]
