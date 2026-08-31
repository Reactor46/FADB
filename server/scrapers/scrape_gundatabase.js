#!/usr/bin/env node
/*
  server/scrapers/scrape_gundatabase.js

  Best-effort crawler + scraper for https://www.thegundatabase.com/
  - Respects robots.txt (basic Disallow parsing)
  - Crawls same-origin links up to a limit
  - Attempts to extract per-page: title, manufacturer, caliber, action, country, year, summary
  - Inserts Manufacturer and Firearm rows into the server SQLite DB (server/db.js)

  Usage:
    cd server
    npm install axios cheerio minimist
    node scrapers/scrape_gundatabase.js --limit=200 --delay=1000

  Notes:
  - This is a best-effort scraper. Site HTML structure may vary; the script attempts multiple heuristics.
  - Run this locally. Do not run heavy crawls against the site. Respect the site's robots.txt and terms.
*/

const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));
const START_URL = 'https://www.thegundatabase.com/';
const LIMIT = parseInt(argv.limit || '200', 10);
const DELAY_MS = parseInt(argv.delay || '1000', 10);

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function fetchRobots(robotsUrl) {
  try {
    const res = await axios.get(robotsUrl, { timeout: 10000 });
    return res.data;
  } catch (err) {
    console.warn('Could not fetch robots.txt, proceeding anyway:', err.message);
    return '';
  }
}

function isAllowedByRobots(robotsText, testPath) {
  // Very small robots.txt parser: checks for Disallow lines under User-agent: *
  const lines = robotsText.split(/\r?\n/).map(l => l.trim());
  let inGlobal = false;
  const disallows = [];
  for (const line of lines) {
    if (/^User-agent:\s*\*/i.test(line)) { inGlobal = true; continue; }
    if (/^User-agent:/i.test(line)) { inGlobal = false; continue; }
    if (!inGlobal) continue;
    const m = line.match(/^Disallow:\s*(.*)$/i);
    if (m) disallows.push(m[1] || '/');
  }
  for (const d of disallows) {
    if (!d) continue;
    if (testPath.startsWith(d)) return false;
  }
  return true;
}

function normalizeLink(href, base) {
  if (!href) return null;
  // ignore anchors and mailto
  if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return null;
  try {
    return new url.URL(href, base).toString();
  } catch (e) { return null; }
}

function extractFieldByLabel($, labelRegex) {
  // Try dt/dd, th/td, .field-name : .field-value patterns
  const text = $('body').text();
  const regexp = new RegExp(labelRegex, 'i');

  // First try table rows
  let found = null;
  $('table').each((i, t) => {
    $(t).find('tr').each((ri, tr) => {
      const th = $(tr).find('th').first().text().trim();
      const td = $(tr).find('td').first().text().trim();
      if (regexp.test(th) && td) { found = td; return false; }
    });
    if (found) return false;
  });
  if (found) return found;

  // try definition lists
  $('dl').each((i, dl) => {
    $(dl).find('dt').each((di, dt) => {
      const dttext = $(dt).text().trim();
      const dd = $(dt).next('dd').first().text().trim();
      if (regexp.test(dttext) && dd) { found = dd; return false; }
    });
    if (found) return false;
  });
  if (found) return found;

  // try labels in paragraphs
  $('p,div,span').each((i, el) => {
    const eltext = $(el).text().trim();
    const m = eltext.match(new RegExp(labelRegex + '\\s*[:\\-\\—]?\\s*(.+)', 'i'));
    if (m) { found = m[1].trim(); return false; }
  });
  if (found) return found;

  // fallback: try meta tags
  const meta = $(`meta[name="${labelRegex}"]`).attr('content');
  if (meta) return meta.trim();

  // not found
  return null;
}

async function crawlAndScrape(startUrl) {
  const parsedStart = new url.URL(startUrl);
  const origin = parsedStart.origin;
  const robotsText = await fetchRobots(new url.URL('/robots.txt', origin).toString());

  const queue = [startUrl];
  const seen = new Set();
  const results = [];

  while (queue.length && results.length < LIMIT) {
    const cur = queue.shift();
    if (seen.has(cur)) continue;
    seen.add(cur);

    const p = new url.URL(cur);
    if (p.origin !== origin) continue;
    const relPath = p.pathname + (p.search || '');
    if (!isAllowedByRobots(robotsText, relPath)) {
      console.warn('Skipping disallowed by robots:', cur);
      continue;
    }

    console.log('Fetching', cur);
    let res;
    try {
      res = await axios.get(cur, { timeout: 15000, headers: { 'User-Agent': 'FADB-scraper/1.0 (+https://github.com/Reactor46/FADB)' } });
    } catch (err) {
      console.warn('Fetch failed', cur, err.message);
      continue;
    }

    const $ = cheerio.load(res.data);

    // collect internal links
    $('a[href]').each((i, a) => {
      const href = $(a).attr('href');
      const nl = normalizeLink(href, cur);
      if (!nl) return;
      const nu = new url.URL(nl);
      if (nu.origin === origin && !seen.has(nl)) {
        // heuristics: only add links that look like gun/manufacturer pages or content pages
        if (/\/(guns|gun|manufacturers|manufacturer|model|weapons|firearm)/i.test(nu.pathname) || nu.pathname.split('/').length <= 3) {
          queue.push(nl);
        }
      }
    });

    // Heuristic: treat pages that contain "Gun" "Caliber" "Manufacturer" details as a firearm page
    const pageText = $('body').text();
    if (/\b(caliber|calibre|manufacturer|action|model|cal\.|firearm)\b/i.test(pageText)) {
      // attempt to extract fields
      const title = ($('h1').first().text().trim()) || $('title').text().split('-')[0].trim();
      const summary = $('meta[name="description"]').attr('content') || $('p').first().text().trim();
      const manufacturer = extractFieldByLabel($, 'Manufacturer|Maker|Made by');
      const caliber = extractFieldByLabel($, 'Caliber|Calibre');
      const action = extractFieldByLabel($, 'Action|Operation|Operation type');
      const country = extractFieldByLabel($, 'Country|Country of origin|Origin');
      const year = extractFieldByLabel($, 'Year|Introduced|Production start|Founded');

      const item = {
        url: cur,
        title: title || null,
        summary: summary || null,
        manufacturer: manufacturer || null,
        caliber: caliber || null,
        action: action || null,
        country: country || null,
        year: year || null
      };

      console.log('Scraped item:', item.title || '(no title)');

      results.push(item);

      // persist into DB
      try {
        // upsert manufacturer
        let manId = null;
        if (item.manufacturer) {
          const existing = db.prepare('SELECT ManufacturerId FROM Manufacturers WHERE Name = ? OR WebsiteUrl = ? LIMIT 1').get(item.manufacturer, item.url);
          if (existing) manId = existing.ManufacturerId;
          else {
            const info = db.prepare(`INSERT INTO Manufacturers (Name, WebsiteUrl, Notes, SourceRef) VALUES (?,?,?,?)`).run(item.manufacturer, null, item.summary || null, item.url);
            manId = info.lastInsertRowid;
          }
        }

        const insert = db.prepare(`INSERT INTO Firearms (ModelName, ManufacturerId, Caliber, ActionType, CountryOfOrigin, Notes, SourceRef, CreatedAt, UpdatedAt)
          VALUES (?,?,?,?,?,?,?,datetime('now'),datetime('now'))`);
        insert.run(item.title || 'Unknown', manId, item.caliber || null, item.action || null, item.country || null, item.summary || null, item.url);
      } catch (err) {
        console.error('DB insert failed for', cur, err.message);
      }
    }

    await sleep(DELAY_MS);
  }

  console.log('Crawl complete. Items scraped:', results.length);
  return results;
}

crawlAndScrape(START_URL).catch(err => {
  console.error('Fatal error in scraper', err);
  process.exit(1);
});
