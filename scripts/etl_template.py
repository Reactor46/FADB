"""
ETL template (Python) — skeleton for harvesting manufacturers and loading into the FADB schema.

This script is a template and intentionally conservative: it shows the pipeline and helper functions but does not
include a production-grade SPARQL query. Use it as a starting point.

Dependencies:
- requests
- pandas
- sqlalchemy

Usage (example):
$ python3 scripts/etl_template.py --mode harvest --out data/manufacturers.csv

"""

import argparse
import csv
import datetime
import logging
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('fadb-etl')


def harvest_from_wikidata(limit: int = 500) -> List[Dict[str, Any]]:
    """Harvest a preliminary list of manufacturers from Wikidata.

    NOTE: This is a placeholder implementation. In a real run you would call the Wikidata
    SPARQL endpoint with a query that finds companies that manufacture firearms or have
    relevant industry tags. This function returns a list of dicts with keys matching
    the Manufacturers table: Name, FullName, Country, FoundedYear, DefunctYear, WebsiteUrl, SourceRef
    """
    logger.info('Harvesting from Wikidata (placeholder) limit=%d', limit)
    # Placeholder — return an empty list for now
    return []


def harvest_from_wikipedia_pages(pages: List[str]) -> List[Dict[str, Any]]:
    """Harvest manufacturer lists from Wikipedia pages (e.g., category pages or list pages).

    This should fetch the page HTML, parse tables and lists, and extract names and links.
    """
    logger.info('Harvesting from Wikipedia pages: %s', pages)
    # Placeholder implementation
    return []


def normalize_record(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize a raw record into the canonical schema fields."""
    # Example normalization steps: strip whitespace, canonicalize country names, parse years.
    rec = {}
    rec['Name'] = raw.get('name') or raw.get('Name') or ''
    rec['FullName'] = raw.get('full_name') or raw.get('FullName')
    rec['Country'] = raw.get('country')
    # Parse years (best-effort)
    def parse_year(x):
        try:
            if x is None:
                return None
            y = int(str(x)[:4])
            return y
        except Exception:
            return None
    rec['FoundedYear'] = parse_year(raw.get('founded') or raw.get('FoundedYear'))
    rec['DefunctYear'] = parse_year(raw.get('defunct') or raw.get('DefunctYear'))
    rec['WebsiteUrl'] = raw.get('website') or raw.get('WebsiteUrl')
    rec['SourceRef'] = raw.get('source') or raw.get('SourceRef')
    return rec


def dedupe(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """De-duplicate records using a simple name-canonicalization approach."""
    seen = {}
    out = []
    for r in records:
        key = r['Name'].strip().lower()
        if key in seen:
            # Merge strategy: prefer the record with more fields populated
            existing = seen[key]
            for k, v in r.items():
                if not existing.get(k) and v:
                    existing[k] = v
        else:
            seen[key] = r.copy()
            out.append(seen[key])
    return out


def write_csv(path: str, records: List[Dict[str, Any]]):
    if not records:
        logger.info('No records to write to CSV: %s', path)
        return
    fieldnames = list(records[0].keys())
    with open(path, 'w', newline='', encoding='utf-8') as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        for r in records:
            writer.writerow(r)
    logger.info('Wrote %d records to %s', len(records), path)


def run_harvest(mode: str, out: str, limit: int):
    raw = []
    raw.extend(harvest_from_wikidata(limit=limit))
    # Optionally add more harvesters: Wikipedia, MilitaryFactory, etc.
    normalized = [normalize_record(r) for r in raw]
    deduped = dedupe(normalized)
    write_csv(out, deduped)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--mode', choices=['harvest'], default='harvest')
    parser.add_argument('--out', default='data/manufacturers.csv')
    parser.add_argument('--limit', type=int, default=500)
    args = parser.parse_args()
    run_harvest(args.mode, args.out, args.limit)


if __name__ == '__main__':
    main()
