#!/usr/bin/env bash
set -euo pipefail

# build_and_push.sh
# Builds the server image (which includes the built client) and pushes it to a Docker registry.

if [ -z "${DOCKER_REPO-}" ]; then
  echo "ERROR: DOCKER_REPO environment variable is not set."
  echo "Set DOCKER_REPO to your personal repo like mydockerhubuser/fadb-app and run again."
  exit 1
fi

IMAGE_TAG="${DOCKER_REPO}:latest"
BUILD_CTX="."
DOCKERFILE="server/Dockerfile"

echo "Building image ${IMAGE_TAG} from ${DOCKERFILE}..."

docker build -f "$DOCKERFILE" -t "$IMAGE_TAG" "$BUILD_CTX"

echo "Built ${IMAGE_TAG}"

# Push
echo "Pushing ${IMAGE_TAG} to registry..."

docker push "$IMAGE_TAG"

echo "Pushed ${IMAGE_TAG}"

# Provide next-step instructions
cat <<EOF
Image successfully built and pushed: ${IMAGE_TAG}

To run it locally without compose:
  docker run --rm -p 8081:5000 -v \/fullpath\/to\/data:/usr/src/app/data ${IMAGE_TAG}

Note: The server image expects data/ to be mounted for persistent storage (SQLite or images) unless you configure MariaDB.
EOF
