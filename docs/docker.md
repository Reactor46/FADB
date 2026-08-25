# Docker notes

This Docker configuration builds two services:
- server: the Node/Express backend (listens on 5000)
- web: the React frontend built and served by nginx (listens on 80 inside container, mapped to 8080)

Quick start

1. Build and start:
   docker-compose up --build -d

2. Visit the frontend at http://localhost:8080
   The frontend proxies API calls to the backend via nginx configuration.

3. Data persistence
   The server mounts ./data, so uploaded images and the SQLite database (data/fadb_user.sqlite) are persisted on the host.

Notes & caveats
- The server image installs libvips (libvips-dev) so Sharp can build; this makes the image larger but improves compatibility across platforms. If you prefer a smaller image and prebuilt Sharp binaries, switch to an Alpine-based image and ensure Sharp's prebuilt binaries are available for your target platform.
- If you run into permission issues with the data directory, ensure it is writable by the container user.
