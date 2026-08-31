#!/usr/bin/env bash
set -euo pipefail

# scripts/setup_and_populate.sh
# Orchestrator: start MariaDB, run scraper in dry-run, then import into MariaDB
# Run from repo root: chmod +x scripts/setup_and_populate.sh && ./scripts/setup_and_populate.sh

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# 1) Start MariaDB stack
if [ ! -f scripts/setup_mariadb.sh ]; then
  echo "setup_mariadb.sh missing. Aborting."
  exit 1
fi
chmod +x scripts/setup_mariadb.sh
./scripts/setup_mariadb.sh

# Load generated env (expects .env.mariadb)
if [ ! -f .env.mariadb ]; then
  echo ".env.mariadb not found — aborting"
  exit 1
fi
# shellcheck disable=SC1091
set -o allexport
source .env.mariadb
set +o allexport

# Wait for MariaDB to accept connections
echo "Waiting for MariaDB to be ready..."
MAX_WAIT=120
i=0
while ! docker exec fadb-mariadb mysqladmin --silent --wait=1 -u root -p"${MARIADB_ROOT_PASSWORD}" ping >/dev/null 2>&1; do
  sleep 1
  i=$((i+1))
  if [ "$i" -ge "$MAX_WAIT" ]; then
    echo "MariaDB did not become ready within ${MAX_WAIT}s. Check container logs with: docker compose -f docker-compose-MariaDB.yml logs mariadb"
    exit 1
  fi
done

echo "MariaDB ready."

# 2) Run the scraper in dry-run to produce JSON
echo "Running scraper (dry-run) — writing server/logs/gundb.json"
mkdir -p server/logs

docker run --rm -v "$ROOT/server":/srv -w /srv node:18-bullseye-slim \
  sh -c "npm install axios cheerio minimist --no-audit --no-fund >/dev/null 2>&1 || true; node scrapers/scrape_gundatabase.js --limit=500 --delay=1000 --out=./logs/gundb.json"

if [ ! -f server/logs/gundb.json ]; then
  echo "Scraper did not produce server/logs/gundb.json — aborting"
  exit 1
fi

echo "Scraper output: server/logs/gundb.json"

# 3) Import JSON into MariaDB using the importer script running in a container
if [ ! -f server/scrapers/import_to_mariadb.js ]; then
  echo "Importer server/scrapers/import_to_mariadb.js missing. Aborting."
  exit 1
fi

echo "Importing JSON into MariaDB..."

docker run --rm -v "$ROOT/server":/srv -v "$ROOT/.env.mariadb":/env.mariadb -w /srv node:18-bullseye-slim \
  sh -c "npm install mysql2 dotenv --no-audit --no-fund >/dev/null 2>&1 || true; node scrapers/import_to_mariadb.js --input=./logs/gundb.json --env-file=/env.mariadb"

echo "Import complete. Check MariaDB for inserted rows."
