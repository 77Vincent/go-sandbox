# Go Sandbox - A Minimalist and Advanced Online Golang Editor

https://www.go-sandbox.org/

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
