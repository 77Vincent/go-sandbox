# local dev
client:
	cd client && npm run dev

# for backend
log-server:
	docker-compose logs -f server
log-gopls:
	docker-compose logs -f gopls
log-localstack:
	docker-compose logs -f localstack
exec-server:
	docker exec -it go-sandbox-server /bin/sh
exec-gopls:
	docker exec -it go-sandbox-gopls /bin/sh
exec-localstack:
	docker exec -it go-sandbox-localstack /bin/sh
server:
	docker-compose up -d
build:
	docker-compose build --progress=plain
down:
	docker-compose down --volumes --remove-orphans

.PHONY: client server down build
