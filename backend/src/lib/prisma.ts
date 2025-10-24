import { PrismaClient } from '@prisma/client';

// Evitar múltiples instancias en dev (hot reload)
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  global.prismaGlobal ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}