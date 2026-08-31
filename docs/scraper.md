# Scraper for TheGunDatabase

This adds a best-effort scraper to extract firearm and manufacturer information from https://www.thegundatabase.com/ and insert it into the app SQLite DB (data/fadb_user.sqlite).

Files added
- sql/schema_sqlite.sql — the default SQLite schema template used by the app.
- server/scrapers/scrape_gundatabase.js — crawler + scraper (uses axios + cheerio). It inserts into Manufacturers and Firearms tables.

How to run
1. Install dependencies (in the server folder):
   cd server
   npm install axios cheerio minimist

2. Run the scraper (be polite; default delay=1000ms, limit=200 pages):
   node scrapers/scrape_gundatabase.js --limit=200 --delay=1000

3. Inspect the DB (host):
   sqlite3 data/fadb_user.sqlite "SELECT ManufacturerId, Name FROM Manufacturers LIMIT 50;"

Notes & legal
- The scraper performs a polite crawl and respects robots.txt in a basic way. You are responsible for ensuring scraping this site is permitted; if you are unsure, do not run the scraper.
- Run locally; do not run heavy crawls against the site. Adjust --delay to increase politeness.
- This is a heuristic scraper and may miss fields depending on site HTML structure. You can extend the extraction heuristics in the script.
