# FADB Windows setup (PowerShell)
# Builds and starts the app via Docker Compose.

$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

Write-Host "FADB setup (Windows)"
Write-Host "Repo root: $RepoRoot"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not on PATH. Install Docker Desktop (with WSL2) and re-run this script."
    exit 1
}

# Prefer 'docker compose' (v2 plugin); fall back to legacy 'docker-compose'
$UseV2 = $true
try {
    docker compose version | Out-Null
} catch {
    $UseV2 = $false
}

function Invoke-Compose {
    param([string[]] $ComposeArgs)
    if ($UseV2) {
        docker compose @ComposeArgs
    } elseif (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        docker-compose @ComposeArgs
    } else {
        Write-Error "Neither 'docker compose' nor 'docker-compose' is available."
        exit 1
    }
}

New-Item -ItemType Directory -Force -Path (Join-Path $RepoRoot 'data') | Out-Null

Write-Host "Building images..."
Invoke-Compose @('build')

Write-Host "Starting containers..."
Invoke-Compose @('up', '-d')

Write-Host ""
Write-Host "FADB is starting up."
Write-Host "  Backend:  http://localhost:8000/api/manufacturers"
Write-Host "  Frontend: http://localhost:3000"
Write-Host ""
Write-Host "View logs with: docker compose logs -f"
Write-Host "Stop with:      docker compose down"
