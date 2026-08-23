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

- The scripts prefer Docker Compose when docker-compose.yml is present (it is present in this repository). They will run `docker compose build` and `docker compose up -d` by default.
- If you need to pass environment variables, create a .env file in the repository root. The docker compose command will automatically pick it up.
- To provide overrides, create docker-compose.override.yml and it will be used automatically by Docker Compose.

Customizing the build

- If your environment requires special build arguments or secrets, the scripts will print instructions; edit the scripts or the docker-compose.yml to add build-args or references to external secret files.

Troubleshooting

- Docker Desktop on Windows may require WSL2 and a reboot after installation.
- If `docker compose` is not available but `docker-compose` is, the scripts will fall back to the older command.
- Some package manager installs may require manual steps; read the script output carefully.

If you'd like, I can further tailor these scripts to set specific environment variables, create sample .env files, or add a GitHub Actions workflow to build and test the compose configuration.
