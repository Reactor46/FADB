#!/usr/bin/env bash
set -euo pipefail

# scripts/build_local.sh
# Build helper for FADB — run from the repo root after cloning.
#
# What it does:
# - Optionally installs Node deps locally (server and client) if npm is available
# - Builds the React client (locally with npm if present, or via docker build)
# - Copies client/build into server/public
# - Builds the server Docker image (which contains the built client)
# - Optionally pushes the image if DOCKER_REPO is set or --push is passed
#
# Usage:
#   chmod +x scripts/build_local.sh
#   ./scripts/build_local.sh [--no-local-npm] [--image name:tag] [--push]
#
# Examples:
#   ./scripts/build_local.sh --image myuser/fadb-app:latest --push
#   ./scripts/build_local.sh --no-local-npm

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

NO_LOCAL_NPM=0
IMAGE_TAG=""
DO_PUSH=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-local-npm) NO_LOCAL_NPM=1; shift ;;
    --image) IMAGE_TAG="$2"; shift 2 ;;
    --push) DO_PUSH=1; shift ;;
    -h|--help) echo "Usage: $0 [--no-local-npm] [--image name:tag] [--push]"; exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

# Defaults
IMAGE_TAG=${IMAGE_TAG:-reactor46/fadb-app:local}

echo "FADB build helper"
echo "Repo root: $ROOT_DIR"

# Helper: run command only if executable exists
has_cmd() { command -v "$1" >/dev/null 2>&1; }

# 1) Try local npm build for client if npm is available and not disabled
if [ "$NO_LOCAL_NPM" -eq 0 ] && has_cmd npm; then
  echo "\n=== Installing and building client locally (using npm) ==="
  if [ -d client ]; then
    pushd client >/dev/null
    if [ -f package-lock.json ]; then
      npm ci
    else
      npm install
    fi
    npm run build
    popd >/dev/null
  else
    echo "No client directory found; skipping local client build"
  fi

  echo "\n=== Installing server deps locally (optional) ==="
  if [ -d server ]; then
    pushd server >/dev/null
    if has_cmd npm; then
      if [ -f package-lock.json ]; then
        npm ci || true
      else
        npm install || true
      fi
    fi
    popd >/dev/null
  fi
else
  echo "\n=== Skipping local npm build (either --no-local-npm or npm not found) ==="
fi

# 2) Copy client build into server/public (if client/build exists)
if [ -d client/build ]; then
  echo "\n=== Copying client/build -> server/public ==="
  rm -rf server/public
  mkdir -p server/public
  cp -R client/build/* server/public/
else
  echo "\n=== client/build not found — server Dockerfile will build the client during image build ==="
fi

# Ensure data dir exists
mkdir -p data
mkdir -p data/images

# 3) Build Docker image
if has_cmd docker; then
  echo "\n=== Building Docker image: $IMAGE_TAG ==="
  docker build -f server/Dockerfile -t "$IMAGE_TAG" .
else
  echo "\nERROR: docker is not installed or not in PATH — cannot build image."
  echo "If you want to build without docker, run the client build locally (npm run build in client) and run the server with 'node server/index.js' after installing server deps." 
  exit 1
fi

# 4) Optionally push
if [ "$DO_PUSH" -eq 1 ]; then
  if [ -z "${DOCKER_REPO-}" ]; then
    echo "DO_PUSH requested. Make sure you're logged in (docker login). Pushing $IMAGE_TAG"
  fi
  echo "Pushing $IMAGE_TAG..."
  docker push "$IMAGE_TAG"
fi

# 5) Summary & quick run examples
cat <<EOF

Build complete.
Image: $IMAGE_TAG

To run the image locally (map host port 8081 -> container 5000):
  docker run --rm -p 8081:5000 -v "
$(pwd)/data:/usr/src/app/data" $IMAGE_TAG

To use docker compose (build and run):
  docker compose up --build -d

Notes:
- If you skipped local npm build, the Dockerfile will build the client as part of the image build.
- If you want to push the image to a registry, provide --image user/repo:tag and run with --push.

EOF
