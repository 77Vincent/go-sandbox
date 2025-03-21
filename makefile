# local dev
client:
	cd client && npm run dev

# docker run
build:
	docker build --platform linux/arm64 -t go-sandbox .

server:
	docker-compose up --build

push:
	aws ecr get-login-password | docker login --username AWS --password-stdin 733089366385.dkr.ecr.ap-northeast-1.amazonaws.com
	docker build --platform linux/arm64 -t 733089366385.dkr.ecr.ap-northeast-1.amazonaws.com/go-sandbox:latest --push .


.PHONY: client server build up
