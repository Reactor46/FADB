Core goal and scope

You said: “database of firearms, all manufacturers, current and former.”

This document mirrors the design notes you provided and the production-focused schema I committed to the repository. It also includes an ETL outline and recommended next steps.

1) Scope
- Manufacturers (companies, current and defunct)
- Brands (trade names, sub-brands)
- Firearms (models, variants)
- Manufacturer relationships (mergers, acquisitions, renames)

2) Recommended schema (already committed as sql/ddl.sql and sql/schema.sql)
- Manufacturers, Brands, FirearmTypes, Firearms, ManufacturerRelations
- SourceRef per record, CreatedAt/UpdatedAt timestamps, IsActive flags

3) Seed data
- A small sample of manufacturers is in sql/seed_manufacturers.sql

4) Data sources and ETL approach
- Primary data sources to ingest (public):
  - Wikidata (SPARQL) — good for structured metadata & identifiers
  - Wikipedia lists & categories — broad coverage, human-readable
  - Military Factory / Ammo.com / Manufacturer websites — additional details
- ETL steps (high level):
  1. Harvest lists (Wikidata/Wikipedia scraping or SPARQL)
  2. Normalize names, map countries and dates
  3. De-duplicate using canonicalization heuristics (casefold, stopwords removal, manual overrides)
  4. Enrich: add website, Wikipedia URL, known models via additional lookups
  5. Upsert into SQL DB with SourceRef and SourcePriority

5) Maintenance and governance
- Keep SourceRef and a SourcePriority column to choose the canonical record when sources disagree
- Periodic re-harvest and reconciliation
- Provide a CONTRIBUTING.md with guidelines for data additions and conflicts resolution

6) Next steps (recommended)
- Implement a Python ETL that uses Wikidata SPARQL and Wikipedia parsing; push normalized CSVs to data/ and then upsert into the DB.
- Add CI job to validate SQL schema and run small ETL smoke tests on pull requests.

