# Go Sandbox - An Advanced Online Golang Editor

https://go-sandbox.org/

![Go Sandbox](https://private-user-images.githubusercontent.com/12905966/427452123-60bfdc3e-0434-4edf-9c8e-00eae5112dc7.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDMwNjk3MDUsIm5iZiI6MTc0MzA2OTQwNSwicGF0aCI6Ii8xMjkwNTk2Ni80Mjc0NTIxMjMtNjBiZmRjM2UtMDQzNC00ZWRmLTljOGUtMDBlYWU1MTEyZGM3LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTAzMjclMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwMzI3VDA5NTY0NVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTc3OWZkMTNkNDkwZGM4ZGNhMzA0NGE5MzMyNjdkOGUyYzA4NTFhYTBkZjQ4NTY0NmNkYWUxMjY0Mzc4NWVkNDMmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.GKaNvUly3glNr6BIxiWeHdJQGEpYzmwq6nti6L5hvsI "an image of the product")

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
