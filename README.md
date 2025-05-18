# ![go sandbox logo](https://www.go-sandbox.org/favicon-32x32.png) Go Sandbox - An IDE-level Go playground

https://www.go-sandbox.org/

## Features

- Realtime execution using websocket
- LSP-backed linting and autocompletion
- Multiple sandboxes
- Share code snippet
- Rich snippet library
- Rich keybinding support

## Deployment

### Frontend
Front-end is a `React app` powered by Vite, using `Tailwind` and `Flowbite`.
It is recommended to use static hosting service like AWS S3 or Amplify.

```bash
cd client && npm install && npm run build
```

To let the client call the server, the environment variable below is required.

```bash
VITE_API_URL=your_backend_hostname
```

### Backend

Backend is a `Go` server using `Gin`. Storage is S3-compatible, using `localstack` for local development. And real `AWS S3` for production.
```bash
sh ./deploy.sh
```

> Please refer to the `.env.production.example` file for the environment variables required for production.

Need to set up the environment variable below for production so that the server will not use the localstack but the real AWS S3.

```bash
GIN_MODE=release
```

## Development

### Client

```bash
cd client && npm install && npm run dev
```

or if you have installed once, then

```bash
make client
```

### Server

Running everything in docker:
```bash
make server
```

Shortcut for logging each component:
```bash
make log-server # see logs of server
make log-gopls # see logs of gopls
make log-localstack # see logs of localstack
```

## Test
 Test codes are yet to be written. Leave below commands for the future.

```bash
make test-client
make test-server
```

## Code Contributors

Welcome to contribute to this project. Please check the issues and PRs.
