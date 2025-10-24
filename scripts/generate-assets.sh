#!/usr/bin/env bash
set -euo pipefail
mkdir -p app/assets
# PNG transparente 1x1 (placeholder)
BASE64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/UbmS4kAAAAASUVORK5CYII="
echo "$BASE64" | base64 -d > app/assets/icon.png
echo "$BASE64" | base64 -d > app/assets/adaptive-icon.png
echo "$BASE64" | base64 -d > app/assets/notification-icon.png
echo "Placeholders creados en app/assets/"