/* eslint-disable no-restricted-properties */
import { z } from 'zod';
import { env } from '../shared/config/env.js';
import { createPrismaClient } from '../shared/database/prisma.client.js';
import { hashPassword } from '../shared/security/password.js';

const seedEnv = z
  .object({
    SEED_ADMIN_EMAIL: z.email(),
    SEED_ADMIN_PASSWORD: z.string().min(12),
  })
  .parse(process.env);

const prisma = createPrismaClient({
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  allowPublicKeyRetrieval: env.NODE_ENV !== 'production',
});

try {
  const email = seedEnv.SEED_ADMIN_EMAIL.trim().toLowerCase();

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Admin',
      passwordHash: await hashPassword(seedEnv.SEED_ADMIN_PASSWORD),
      role: 'ADMIN',
      status: 'ACTIVE',
      activatedAt: new Date(),
    },
  });

  console.log(`Admin ready: ${admin.email}`);
} finally {
  await prisma.$disconnect();
}