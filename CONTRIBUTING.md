Thank you for contributing to FADB!

This repository maintains a curated/aggregated list of firearms manufacturers and models.

Contribution guidelines

- Add new manufacturers or models via PRs against the `main` branch (or feature branches if the change is large).
- Include a SourceRef field for every new record you add (a URL to the source like Wikipedia, Wikidata, or manufacturer's site).
- When adding historical changes (mergers/acquisitions), add entries to ManufacturerRelations with notes and SourceRef.

Data quality

- Attempt to normalize company names (remove diacritics, remove company suffixes only when appropriate in notes).
- If you find duplicates, submit a PR that consolidates them and retains SourceRef for provenance.

ETL and automation

- Use scripts/etl_template.py as the starting point for programmatic harvesting. If you write long-running harvesters, add them under scripts/ and document source usage and licensing.

License

All repository content is MIT licensed unless noted otherwise in a data source file.
