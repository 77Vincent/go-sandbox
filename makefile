# local dev
client:
	cd client && npm run dev

# docker run
build:
	docker build --platform linux/arm64 -t go-sandbox .
up:
	docker run -p 8080:8080 go-sandbox

.PHONY: client server build up
