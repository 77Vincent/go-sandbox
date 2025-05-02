![image](https://github.com/user-attachments/assets/1ce68a3a-2f79-4034-98bb-d170a6a9fa0e)# Go Sandbox - An Advanced Online Golang Editor

https://www.go-sandbox.org/

<img src="https://private-user-images.githubusercontent.com/12905966/439828694-7abc69e1-e9c5-4ad6-90b8-991087bf7dd8.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDYxNzAwODEsIm5iZiI6MTc0NjE2OTc4MSwicGF0aCI6Ii8xMjkwNTk2Ni80Mzk4Mjg2OTQtN2FiYzY5ZTEtZTljNS00YWQ2LTkwYjgtOTkxMDg3YmY3ZGQ4LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA1MDIlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTAyVDA3MDk0MVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWQ2NjdkM2JiYTEwZDE5MjQ5NmYxZTg1YWJhMTNiZjk2YmMzZjE5ZjUzYzM1YzMzMWRmM2E0ZDFmMTg5ZGQ3NTcmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.yCrmnuZqzaBBJClgJZG3z-L7rs8cjsyLRfzyuhwmjgY"/>

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
