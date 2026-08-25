# For the backend
docker build -f server/Dockerfile -t fadb-backend .

# For the frontend
docker build -f web/Dockerfile -t fadb-frontend .
