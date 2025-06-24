# local dev
client:
	cd client && npm run dev

# for backend
log-server:
	docker-compose logs -f server
log-gopls:
	docker-compose logs -f gopls
log-gopls2:
	docker-compose logs -f gopls2
log-localstack:
	docker-compose logs -f localstack
exec-server:
	docker exec -it go-sandbox-server /bin/sh
exec-gopls:
	docker exec -it go-sandbox-gopls /bin/sh
exec-gopls2:
	docker exec -it go-sandbox-gopls2 /bin/sh
exec-localstack:
	docker exec -it go-sandbox-localstack /bin/sh
server:
	docker-compose up -d
build:
	docker-compose build --progress=plain
build-server:
	docker-compose build --progress=plain server --no-cache
down:
	docker-compose down --volumes --remove-orphans

# for test

.PHONY: client server down build
