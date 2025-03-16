# local dev
client:
	cd client && npm run dev

server:
	go run main.go

# docker run
up:
	docker build -t go-sandbox .
	docker run -p 8080:8080 go-sandbox

.PHONY: client server
