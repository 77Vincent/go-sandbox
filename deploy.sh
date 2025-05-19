#!/bin/bash
# used by the CI/CD pipeline to deploy the latest code to the server
set -e

echo "Pulling latest code..."
git pull origin main

echo "Building API service..."
docker compose build

echo "Stopping old server container..."
docker compose stop server

echo "Starting new server container..."
docker compose up -d server

echo "✅ Deployed successfully!"
