#!/bin/bash
set -e

echo "Pulling latest code..."
git pull origin main

echo "Building API service..."
docker compose build server

echo "Stopping old API container..."
docker compose stop server

echo "Starting new API container..."
docker compose up -d server

echo "✅ Deployed successfully!"
