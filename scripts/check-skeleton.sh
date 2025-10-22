#!/usr/bin/env bash
set -euo pipefail

expected=(
  "docker-compose.yml"
  "backend/.env"
  "backend/package.json"
  "backend/tsconfig.json"
  "backend/prisma/schema.prisma"
  "backend/prisma/seed.ts"
  "backend/src/index.ts"
  "backend/src/server.ts"
  "backend/src/lib/prisma.ts"
  "backend/src/middleware/auth.ts"
  "backend/src/routes/auth.ts"
  "backend/src/routes/teams.ts"
  "backend/src/routes/players.ts"
  "backend/src/routes/matches.ts"
  "backend/src/routes/users.ts"
  "backend/src/routes/stats.ts"
  "backend/src/routes/players-upload.ts"
  "app/.env"
  "app/app.json"
  "app/package.json"
  "app/src/config.ts"
  "app/src/App.tsx"
  "app/src/store/index.ts"
  "app/src/services/api.ts"
  "app/src/services/notifications.ts"
  "app/src/navigation/RootNavigator.tsx"
  "app/src/components/MatchCard.tsx"
  "app/src/screens/LoginScreen.tsx"
  "app/src/screens/HomeScreen.tsx"
  "app/src/screens/TeamsScreen.tsx"
  "app/src/screens/TeamDetailScreen.tsx"
  "app/src/screens/MatchesScreen.tsx"
  "app/src/screens/MatchDetailScreen.tsx"
  "app/src/screens/PlayerPhotoScreen.tsx"
)

missing=0
for f in "${expected[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "Falta: $f"
    ((missing++)) || true
  fi
done

total=${#expected[@]}
echo "Archivos esperados: $total"
echo "Archivos faltantes: $missing"

if [[ $missing -eq 0 ]]; then
  echo "OK: estructura completa."
  exit 0
else
  echo "Hay archivos faltantes. Ejecuta nuevamente el make-skeleton o crea a mano los que faltan."
  exit 1
fi