client:
	cd client && npm run dev

server:
	go run main.go

.PHONY: client server
