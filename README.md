# Go Sandbox - An Advanced Online Golang Editor

https://www.go-sandbox.org/

<img src="https://private-user-images.githubusercontent.com/12905966/428395448-3ce240f1-29d5-4871-9be2-9e76d4a547cf.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDMzMzg4NTksIm5iZiI6MTc0MzMzODU1OSwicGF0aCI6Ii8xMjkwNTk2Ni80MjgzOTU0NDgtM2NlMjQwZjEtMjlkNS00ODcxLTliZTItOWU3NmQ0YTU0N2NmLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTAzMzAlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwMzMwVDEyNDIzOVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTZjYTA0ZjRlMWM5NDA5ZDQwMzQxMDhhNGYzNGQ4ODc1ZmVmNDdmMTQyMDI0NDg5Njg2NzE2ZDRhMmZlOGU4ZWMmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.0i8_9S2OL7YZb1LI-5ZUVUoW2OVPxW2R_y4ky_n7O4U"/>

## Features

- Realtime execution using websocket
- LSP-backed linting and autocompletion
- Multiple sandboxes
- Share code snippet
- Rich snippet library
- Rich keybinding support

## Development

### Prerequisites

- Node.js
- Docker

### Client

```bash
cd client && npm install && npm run dev
```

or if you have installed once, then

```bash
make client
```

### Server

```bash
make server
```

## Test

### Client

```bash
cd client && npm run test
```

### Server

```bash
make test
```
