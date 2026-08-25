# Dockerfile for server

FROM node:18-bullseye-slim

# Install packages often required for native modules (sharp)
RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential python3 make gcc g++ libvips-dev ca-certificates && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --production

# Copy the rest of the server
COPY . .

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "index.js"]
