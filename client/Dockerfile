# Dockerfile for React client -> build -> nginx static

FROM node:18-alpine AS build
WORKDIR /app
# Copy package.json and package-lock if present, then install dependencies
COPY package.json package-lock.json* ./
# Use npm install to avoid failing when package-lock.json is absent in the repo
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
