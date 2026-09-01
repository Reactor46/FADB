#!/usr/bin/env node
/*
  server/scrapers/scrape_genitron.js

  Best-effort crawler + scraper for https://www.genitron.com/
  - Respects robots.txt (basic Disallow parsing)
  - Crawls same-origin links up to a limit
  - Attempts to extract per-page: title, manufacturer, caliber, action, country, year, summary
  - When --out is provided, writes JSON array of items and does NOT insert into DB

  Usage:
    cd server
    npm install axios cheerio minimist
    node scrapers/scrape_genitron.js --limit=200 --delay=1000 --out=./logs/genitron.json

  Notes:
  - This is a best-effort scraper. Site HTML structure may vary; the script attempts multiple heuristics.
  - Run this locally. Do not run heavy crawls against the site. Respect robots.txt and terms.
*/

const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const path = require('path');
const fs = require('fs');
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));
const START_URL = 'https://www.genitron.com/';
const LIMIT = parseInt(argv.limit || '200', 10);
const DELAY_MS = parseInt(argv.delay || '1000', 10);
const OUT_PATH = argv.out || null; // if provided, write parsed items to this JSON file and do not insert into DB

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
  if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return null;
  try { return new url.URL(href, base).toString(); } catch (e) { return null; }
}

function extractText($, sel) {
  const v = $(sel).first().text().trim();
  return v || null;
}

function extractFieldByLabel($, labelRegex) {
  const regexp = new RegExp(labelRegex, 'i');
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

  $('dl').each((i, dl) => {
    $(dl).find('dt').each((di, dt) => {
      const dttext = $(dt).text().trim();
      const dd = $(dt).next('dd').first().text().trim();
      if (regexp.test(dttext) && dd) { found = dd; return false; }
    });
    if (found) return false;
  });
  if (found) return found;

  $('p,div,span').each((i, el) => {
    const eltext = $(el).text().trim();
    const m = eltext.match(new RegExp(labelRegex + '\\s*[:\\-\\—]?\\s*(.+)', 'i'));
    if (m) { found = m[1].trim(); return false; }
  });
  if (found) return found;

  const meta = $(`meta[name="${labelRegex}"]`).attr('content');
  if (meta) return meta.trim();
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
        // heuristics: genitron organizes pages under /gun/ /weapon/ /manufacturers etc.
        if (/\/(gun|guns|weapons|weapon|manufacturers|manufacturer|models|model|firearm)/i.test(nu.pathname) || nu.pathname.split('/').length <= 3) {
          queue.push(nl);
        }
      }
    });

    // Heuristic: treat pages that contain firearm terms as a firearm page
    const pageText = $('body').text();
    if (/\b(gun|guns|caliber|calibre|manufacturer|action|model|firearm|weapon)\b/i.test(pageText)) {
      const title = extractText($, 'h1') || extractText($, 'title') || null;
      const summary = $('meta[name="description"]').attr('content') || extractText($, '.summary') || extractText($, '.lead') || extractText($, 'p') || null;
      const manufacturer = extractFieldByLabel($, 'Manufacturer|Maker|By');
      const caliber = extractFieldByLabel($, 'Caliber|Calibre');
      const action = extractFieldByLabel($, 'Action|Operation');
      const country = extractFieldByLabel($, 'Country|Origin|Country of origin');
      const year = extractFieldByLabel($, 'Year|Introduced|Production');

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
    }

    await sleep(DELAY_MS);
  }

  console.log('Crawl complete. Items scraped:', results.length);
  if (OUT_PATH) {
    try {
      const outDir = path.dirname(OUT_PATH);
      if (outDir && !fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2), 'utf8');
      console.log('Wrote', OUT_PATH);
    } catch (err) {
      console.error('Failed to write output file', err.message);
    }
  }
  return results;
}

crawlAndScrape(START_URL).catch(err => {
  console.error('Fatal error in genitron scraper', err);
  process.exit(1);
});
