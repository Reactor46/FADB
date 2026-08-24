# Run the FADB app (local)

This repository now includes a minimal frontend and backend to let you add firearms and photos for personal use.

Quick start

1. Backend
   - cd server
   - npm install
   - npm start
   - server runs on port 5000 by default

2. Frontend
   - cd client
   - npm install
   - npm start
   - visit http://localhost:3000 and use the Add Firearm form

Notes
- Images are saved under data/images/ and committed to the repo when you add them (since you requested repo storage). If you intend to commit user images, be aware of repo size growth.
- The server creates data/fadb_user.sqlite for storage.
