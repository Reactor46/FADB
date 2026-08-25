# Multi-stage Dockerfile: build React client and run Express server in one container

FROM node:18-alpine AS client-build
WORKDIR /client
# Copy client package files and install
COPY client/package.json client/package-lock.json* ./
RUN npm install
# Copy client source and build
COPY client/ ./
RUN npm run build

# Server stage
FROM node:18-bullseye-slim

# Install packages needed for native modules (sharp)
RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential python3 make gcc g++ libvips-dev ca-certificates && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy server package files and install production deps
COPY server/package.json server/package-lock.json* ./
# Use npm install --production to avoid failing when package-lock.json is absent
RUN npm install --production

# Copy server source
COPY server/ ./

# Copy client build into server public directory
COPY --from=client-build /client/build ./public

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "index.js"]
