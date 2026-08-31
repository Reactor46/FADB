#!/usr/bin/env bash
set -euo pipefail

# scripts/select_db.sh
# Toggle docker-compose.yml between sqlite and mariadb by uncommenting/commenting mariadb block
# and server DB environment lines. Shows a diff and prompts for confirmation.

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

usage(){
  echo "Usage: $0 <sqlite|mariadb> [--enable-traefik] [--yes]"
  exit 2
}

if [ "$#" -lt 1 ]; then usage; fi
CHOICE="$1"
ENABLE_TRAEFIK=0
AUTO_YES=0
shift
while [ "$#" -gt 0 ]; do
  case "$1" in
    --enable-traefik) ENABLE_TRAEFIK=1; shift ;;
    --yes) AUTO_YES=1; shift ;;
    -h|--help) usage ;;
    *) echo "Unknown arg: $1"; usage ;;
  esac
done

DC="docker-compose.yml"
if [ ! -f "$DC" ]; then echo "Cannot find $DC in $ROOT_DIR"; exit 3; fi

TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP="${DC}.bak.${TIMESTAMP}"
cp "$DC" "$BACKUP"

TMP="${DC}.tmp"

awk -v choice="$CHOICE" -v traefik="$ENABLE_TRAEFIK" '
  BEGIN { in_mdb = 0; in_traefik = 0 }
  {
    if ($0 ~ /# MARIADB-BEGIN/) { in_mdb = 1; print; next }
    if ($0 ~ /# MARIADB-END/)   { in_mdb = 0; print; next }

    if (in_mdb) {
      if (choice == "mariadb") {
        sub(/^[ \t]*#[ \t]?/, "", $0)
      } else {
        if ($0 !~ /^[ \t]*#/) $0 = "# " $0
      }
      print; next
    }

    # Server DB env lines
    if ($0 ~ /[ \t]*#?[ \t]*- DB_TYPE=mariadb/ || $0 ~ /[ \t]*#?[ \t]*- DB_HOST=mariadb/ || $0 ~ /[ \t]*#?[ \t]*- DB_PORT=3306/ || $0 ~ /[ \t]*#?[ \t]*- DB_NAME=/ || $0 ~ /[ \t]*#?[ \t]*- DB_USER=/ || $0 ~ /[ \t]*#?[ \t]*- DB_PASS=/) {
      if (choice == "mariadb") sub(/^[ \t]*#[ \t]?/, "", $0)
      else if ($0 !~ /^[ \t]*#/) $0 = "# " $0
      print; next
    }

    # depends_on placeholder
    if ($0 ~ /- ""/ ) {
      if (choice == "mariadb") sub(/- ""/, "- mariadb")
      else sub(/- mariadb/, "- """)
      print; next
    }

    # Traefik block markers
    if ($0 ~ /# TRAEFIK-BEGIN/) { in_traefik = 1; print; next }
    if ($0 ~ /# TRAEFIK-END/)   { in_traefik = 0; print; next }

    if (in_traefik) {
      if (traefik == "1") {
        sub(/^[ \t]*#[ \t]?/, "", $0)
      } else {
        if ($0 !~ /^[ \t]*#/) $0 = "# " $0
      }
      print; next
    }

    print
  }
' "$DC" > "$TMP"

# Show diff and ask for confirmation unless --yes
echo "--- Proposed changes to $DC (backup at $BACKUP) ---"
if command -v diff >/dev/null 2>&1; then
  diff -u "$BACKUP" "$TMP" || true
else
  echo "(diff not available)"
fi

if [ "$AUTO_YES" -ne 1 ]; then
  read -p "Apply these changes to $DC? [y/N] " yn
  case "$yn" in
    [Yy]*) mv "$TMP" "$DC" ;;
    *)
      echo "Aborting; restored original file at $BACKUP"
      rm -f "$TMP"
      exit 1 ;;
  esac
else
  mv "$TMP" "$DC"
fi

# Bring up compose
if [ "$CHOICE" = "mariadb" ]; then
  if [ -f .env.mariadb ]; then
    docker compose --env-file .env.mariadb up --build -d
  else
    echo "Warning: .env.mariadb not found. Run scripts/setup_mariadb.sh if you need credentials."
    docker compose up --build -d
  fi
else
  docker compose up --build -d
fi

sleep 6

echo "docker compose ps:"
docker compose ps

# server check
echo "Checking server HTTP: http://localhost:8081/"
if curl -sSf --max-time 5 http://localhost:8081/ >/dev/null 2>&1; then
  echo "Server responded on http://localhost:8081/"
else
  echo "Server did not respond on http://localhost:8081/ — checking logs"
  docker compose logs server --tail=200
fi

# mariadb check
if [ "$CHOICE" = "mariadb" ]; then
  if docker ps --format '{{.Names}}' | grep -q 'fadb-mariadb'; then
    if [ -f .env.mariadb ]; then
      MROOT=""
      while IFS='=' read -r key val; do
        case "$key" in
          MARIADB_ROOT_PASSWORD) MROOT="$val" ;;
        esac
      done < <(grep -E '^[A-Z0-9_]+=.*' .env.mariadb || true)

      if [ -n "$MROOT" ]; then
        if docker exec fadb-mariadb mysqladmin --silent --wait=1 -u root -p"$MROOT" ping >/dev/null 2>&1; then
          echo "MariaDB is accepting connections."
        else
          echo "MariaDB is not responding to mysqladmin ping. Check logs:"
          docker compose logs mariadb --tail=200
        fi
      else
        echo "No MARIADB_ROOT_PASSWORD found in .env.mariadb; skipping mysqladmin check."
      fi
    else
      echo ".env.mariadb not present — skipping mysqladmin check. Check container logs if needed:"
      docker compose logs mariadb --tail=200
    fi
  else
    echo "MariaDB container not found in docker ps — check docker compose output."
  fi
fi

echo "Done."
