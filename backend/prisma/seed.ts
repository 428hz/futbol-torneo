import { prisma } from '../src/lib/prisma.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar siempre backend/.env (funciona en dev y build)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const a = await prisma.team.upsert({
    where: { name: 'Leones FC' },
    update: {},
    create: { name: 'Leones FC', crestUrl: '' }
  });
  const b = await prisma.team.upsert({
    where: { name: 'Tigres United' },
    update: {},
    create: { name: 'Tigres United', crestUrl: '' }
  });

  await prisma.player.createMany({
    data: [
      { firstName: 'Juan', lastName: 'Pérez', age: 24, position: 'Delantero', jerseyNumber: 9, teamId: a.id },
      { firstName: 'Luis', lastName: 'Gómez', age: 27, position: 'Mediocampista', jerseyNumber: 8, teamId: a.id },
      { firstName: 'Carlos', lastName: 'Díaz', age: 22, position: 'Defensor', jerseyNumber: 4, teamId: b.id }
    ],
    skipDuplicates: true
  });

  const v = await prisma.venue.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Estadio Central', address: 'Av. Siempre Viva 123', latitude: -34.6037, longitude: -58.3816 }
  });

  await prisma.match.create({
    data: {
      homeTeamId: a.id,
      awayTeamId: b.id,
      venueId: v.id,
      datetime: new Date(Date.now() + 1000 * 60 * 60 * 24)
    }
  });
}

main().then(() => {
  console.log('Seed done');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});