# local dev
client:
	cd client && npm run dev

server:
	docker-compose up --build


.PHONY: client server
