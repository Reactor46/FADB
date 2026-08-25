# Docker notes — single-container (Express serves static build)

This repo now builds a single container that includes both the React frontend (built into /public)
and the Express server which serves API endpoints. This simplifies deployment: one container serves
both static assets and the API.

Quick start

1. Build and start:
   docker compose up --build -d

2. Visit the app at http://localhost:8081

3. Data persistence
   The server mounts ./data, so uploaded images and the SQLite database (data/fadb_user.sqlite) are persisted on the host.

Notes & caveats
- The Docker build context is the repo root so the server Dockerfile can access the client/ folder to build the frontend.
- The server image installs libvips-dev so Sharp can create thumbnails.
- If you experience permission issues with ./data, run:
  sudo chown -R $(id -u):$(id -g) ./data

