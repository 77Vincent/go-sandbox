# local dev
client:
	cd client && npm run dev

# for backend
log-server:
	docker-compose logs -f server
log-localstack:
	docker-compose logs -f localstack
exec-server:
	docker exec -it go-sandbox-server /bin/sh
exec-localstack:
	docker exec -it go-sandbox-localstack /bin/sh
server:
	docker-compose up -d

build:
	docker-compose build
build-server:
	docker-compose build server
down:
	docker-compose down --volumes --remove-orphans

# for test

.PHONY: client server down build
