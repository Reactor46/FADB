# FADB — Firearms Database

This repository contains a production-friendly foundation for a firearms database (manufacturers, models, relationships, and history). It was generated and populated with a recommended schema and example seed data.

Included:
- sql/schema.sql — recommended SQL schema (DDL) for Manufacturers, Brands, FirearmTypes, Firearms, and ManufacturerRelations.
- sql/seed_manufacturers.sql — example seed data (sample manufacturers) to show how records map to the schema.
- README.md — this file.

Core goal and scope

The goal is to model:
- Manufacturers (companies, current and defunct)
- Brands (trade names/sub-brands)
- Firearms (models and variants)
- Manufacturer relationships (mergers, acquisitions, renames)

This is intended as a foundation for an ETL pipeline that can ingest public sources like Wikipedia, Military Factory, Ammo.com, and Wikidata.

How to use

1. Import the schema into your SQL Server (or adapt types for Postgres/MySQL/SQLite).
2. Run the seed file to populate a small sample dataset.
3. Build an ETL script to ingest external lists and normalize them into this schema.

Licensing

This repository is licensed under the MIT License.
