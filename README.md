# Go Sandbox - An Advanced Online Golang Editor

https://www.go-sandbox.org/

![Go Sandbox](https://private-user-images.githubusercontent.com/12905966/428267341-0ab8dd88-51a5-4920-a1c9-2112f60959c5.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDMyMjQ0MDMsIm5iZiI6MTc0MzIyNDEwMywicGF0aCI6Ii8xMjkwNTk2Ni80MjgyNjczNDEtMGFiOGRkODgtNTFhNS00OTIwLWExYzktMjExMmY2MDk1OWM1LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTAzMjklMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwMzI5VDA0NTUwM1omWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTNlODY1Y2FmNDVkMWQxOTRmNTRmZDY1ZTFhYTRkYjEzM2FhMmQxMDU2ZmYxZmQ0OTkzMjMyYmIzYzY1NzYyODYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.fg72CbNKqNA0DyAnVIrMRQxMqNdrKV_UX5mpTB33UeE "an image of the product")

## Features

### Core

- Automatic Realtime Execution
- Overload protection

### UI/UX

- VIM and EMACS Keybindings
- Syntax Highlighting
- Code templating and sharing
- Dark mode

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
