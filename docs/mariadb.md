# MariaDB + Traefik notes

This compose file (docker-compose-MariaDB.yml) is intended for optional use when you want to run the app with MariaDB as the backing store and with Traefik as an optional reverse-proxy.

Usage

1. Generate credentials and start the stack (recommended):
   chmod +x scripts/setup_mariadb.sh
   ./scripts/setup_mariadb.sh

2. The script writes credentials to .env.mariadb and logs them to logs/mariadb-credentials.log.

3. By default the server container is configured to read DB connection info from environment variables:
   - DB_TYPE=mariadb
   - DB_HOST=mariadb
   - DB_PORT=3306
   - DB_NAME, DB_USER, DB_PASS from .env.mariadb

Notes & caveats
- The application code currently uses SQLite by default. Switching to MariaDB also requires updating the server code to speak MySQL/MariaDB (e.g., using mysql2 and a different schema migration path).
- Traefik labels in docker-compose-MariaDB.yml are commented out; uncomment and set your Host() rule domain to enable routing through Traefik.
- The setup script prints the generated DB passwords into logs/mariadb-credentials.log for easy retrieval. Keep these logs secure.
