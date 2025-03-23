#!/bin/bash
set -e

echo "Pulling latest code..."
git pull origin main

echo "Building API service..."
docker compose build api

echo "Stopping old API container..."
docker compose stop api

echo "Starting new API container..."
docker compose up -d api

echo "✅ Deployed successfully!"
