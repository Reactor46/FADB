# FADB — Frontend & Backend for personal firearm uploads

This commit adds a minimal React frontend and Node/Express backend to let a user add firearms, take/upload photos, and store records (including serial numbers) in a local SQLite DB.

Overview

- server/: Express backend. Endpoints:
  - GET /api/manufacturers
  - POST /api/manufacturers
  - GET /api/firearms
  - POST /api/firearms (multipart/form-data, field 'photo')
  - /images/* serves uploaded images from data/images/
- client/: React single-page app with a form to add firearms and a list view.
- data/: images saved here by the server (empty placeholder committed). The server writes data/fadb_user.sqlite for persistent storage.
- sql/: existing DDLs updated earlier to include user fields (SerialNumber, PhotoFileName, ThumbnailFileName, Extra JSON).

Run locally (dev)

1) Backend
   cd server
   npm install
   npm run start
   # server listens on :5000

2) Frontend
   cd client
   npm install
   npm run start
   # dev server on :3000 proxies API calls to :5000 if you configure a proxy

Notes

- This MVP intentionally omits authentication — the DB is stored locally at data/fadb_user.sqlite. Images are saved to data/images/ inside the repo (as you requested for personal use).
- The server creates thumbnails (800px) using sharp. Install sharp during npm install (prebuilt binaries or build dependencies may be required).
- The Firearms table contains an Extra TEXT field where the backend admin can store JSON with extra fields; you can implement an admin UI later to add structured fields.

Next steps (optional)
- Add a proxy configuration so the React dev server forwards API requests to the backend during development (or run build and serve static files from Express).
- Add simple password protection or local auth.

