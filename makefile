# local dev
client:
	cd client && npm run dev

# for backend
log:
	docker-compose logs -f
exec-server:
	docker exec -it go-sandbox-server /bin/sh
exec-gopls:
	docker exec -it go-sandbox-gopls /bin/sh
server:
	docker-compose up -d
build:
	docker-compose build --progress=plain
down:
	docker-compose down --volumes --remove-orphans

.PHONY: client server down build
