# Build and run instructions for FADB

This file explains how to use the included setup scripts to prepare and build the FADB application.

Files added:

- scripts/FADB-setup.ps1 — Interactive PowerShell helper for Windows (uses winget/choco when available).
- scripts/FADB-setup.sh — Interactive Bash helper for Linux (detects apt/dnf/pacman/zypper).

Quick start

1. Clone the repository and change to the repo root.

   git clone https://github.com/Reactor46/FADB.git
   cd FADB

2. Run the appropriate script:

- Windows (PowerShell):
  - Open PowerShell as Administrator, then run:
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    .\scripts\FADB-setup.ps1

- Linux (bash):
  - Make the script executable and run it:
    chmod +x scripts/FADB-setup.sh
    ./scripts/FADB-setup.sh

Notes on building

- The scripts require Docker (and either the `docker compose` plugin or the
  legacy `docker-compose` binary) to be installed. They run `docker compose
  build` followed by `docker compose up -d`.
- On first run, the backend automatically loads `data/sample_firearms.csv`
  into its SQLite database (see server/app/crud.py:seed_from_csv_if_empty).
  No manual import step is required. The database file itself is stored in
  a Docker named volume (`fadb-db`), separate from the read-only
  `data/` source folder, so it persists across restarts.
- If you need to pass environment variables, create a .env file in the repository root. The docker compose command will automatically pick it up.
- To provide overrides, create docker-compose.override.yml and it will be used automatically by Docker Compose.

Customizing the build

- If your environment requires special build arguments or secrets, the scripts will print instructions; edit the scripts or the docker-compose.yml to add build-args or references to external secret files.

Troubleshooting

- Docker Desktop on Windows may require WSL2 and a reboot after installation.
- If `docker compose` is not available but `docker-compose` is, the scripts will fall back to the older command.
- If you want to load a bigger dataset via raw SQL instead of the CSV
  auto-seed, use sql/inserts_small_import_mysql.sql — but only against a
  database created from sql/ddl_mysql.sql (lowercase snake_case columns).
  It is not compatible with schema.sql / ddl.sql (PascalCase columns),
  which is what the bundled SQLite backend uses.

If you'd like, I can further tailor these scripts to set specific environment variables, create sample .env files, or add a GitHub Actions workflow to build and test the compose configuration.
