#!/usr/bin/env bash
set -euo pipefail

# Directorios
mkdir -p backend/{src/{routes,lib,middleware},prisma,uploads}
mkdir -p app/src/{components,services,store,navigation,screens}
mkdir -p app/assets
mkdir -p scripts

# Backend files (vacíos)
touch backend/.env
touch backend/package.json
touch backend/tsconfig.json
touch backend/prisma/schema.prisma
touch backend/prisma/seed.ts
touch backend/src/index.ts
touch backend/src/server.ts
touch backend/src/lib/prisma.ts
touch backend/src/middleware/auth.ts
touch backend/src/routes/auth.ts
touch backend/src/routes/teams.ts
touch backend/src/routes/players.ts
touch backend/src/routes/matches.ts
touch backend/src/routes/users.ts
touch backend/src/routes/stats.ts
touch backend/src/routes/players-upload.ts

# App files (vacíos)
touch app/.env
touch app/app.json
touch app/package.json
touch app/src/config.ts
touch app/src/App.tsx
touch app/src/store/index.ts
touch app/src/services/api.ts
touch app/src/services/notifications.ts
touch app/src/navigation/RootNavigator.tsx
touch app/src/components/MatchCard.tsx
touch app/src/screens/LoginScreen.tsx
touch app/src/screens/HomeScreen.tsx
touch app/src/screens/TeamsScreen.tsx
touch app/src/screens/TeamDetailScreen.tsx
touch app/src/screens/MatchesScreen.tsx
touch app/src/screens/MatchDetailScreen.tsx
touch app/src/screens/PlayerPhotoScreen.tsx

# Root-level
touch docker-compose.yml

echo "Estructura creada/actualizada."