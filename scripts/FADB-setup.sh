#!/usr/bin/env bash
set -euo pipefail

# FADB Linux setup
# Detects a package manager (informational only), then builds and starts
# the app via Docker Compose.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "FADB setup (Linux)"
echo "Repo root: $REPO_ROOT"

# Informational: detect package manager (not used to install anything by default)
if command -v apt-get >/dev/null 2>&1; then
    PKG_MGR="apt"
elif command -v dnf >/dev/null 2>&1; then
    PKG_MGR="dnf"
elif command -v pacman >/dev/null 2>&1; then
    PKG_MGR="pacman"
elif command -v zypper >/dev/null 2>&1; then
    PKG_MGR="zypper"
else
    PKG_MGR="unknown"
fi
echo "Detected package manager: $PKG_MGR"

if ! command -v docker >/dev/null 2>&1; then
    echo "ERROR: docker is not installed or not on PATH." >&2
    echo "Install Docker Engine for your distro, then re-run this script." >&2
    exit 1
fi

# Prefer 'docker compose' (v2 plugin); fall back to legacy 'docker-compose'
if docker compose version >/dev/null 2>&1; then
    COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE=(docker-compose)
else
    echo "ERROR: Neither 'docker compose' nor 'docker-compose' is available." >&2
    exit 1
fi

echo "Using compose command: ${COMPOSE[*]}"

mkdir -p data

echo "Building images..."
"${COMPOSE[@]}" build

echo "Starting containers..."
"${COMPOSE[@]}" up -d

echo ""
echo "FADB is starting up."
echo "  Backend:  http://localhost:8000/api/manufacturers"
echo "  Frontend: http://localhost:3000"
echo ""
echo "View logs with: ${COMPOSE[*]} logs -f"
echo "Stop with:      ${COMPOSE[*]} down"
