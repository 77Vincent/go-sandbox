# local dev
client:
	cd client && npm run dev

server:
	docker-compose up --build -d
down:
	docker-compose down --volumes --remove-orphans

.PHONY: client server down
