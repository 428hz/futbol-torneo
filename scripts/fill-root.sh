#!/usr/bin/env bash
set -euo pipefail

# docker-compose
cat > docker-compose.yml <<'EOF'
services:
  db:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: futbol_torneo
      MYSQL_USER: app
      MYSQL_PASSWORD: app123
      MYSQL_ROOT_PASSWORD: rootpass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
volumes:
  mysql_data:
EOF

echo "Root files written."