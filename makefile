# local dev
client:
	cd client && npm run dev

server:
	go run main.go

# docker run
build:
	docker build -t go-sandbox .
up:
	docker run --cap-add=SYS_RESOURCE --security-opt seccomp=unconfined -p 8080:8080 go-sandbox

.PHONY: client server build up
