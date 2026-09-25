/* eslint-disable no-restricted-properties */
import { z } from 'zod';
import { env } from '../shared/config/env.js';
import { createPrismaClient } from '../shared/database/prisma.client.js';
import { hashPassword } from '../shared/security/password.js';
import type { PrismaClient } from '../generated/prisma/client.js';
import { hashApiKey } from '../shared/security/api-key.js';

const seedEnv = z
  .object({
    SEED_ADMIN_EMAIL: z.email(),
    SEED_ADMIN_PASSWORD: z.string().min(12),
    DEV_PARTNER_API_KEY: z.string().startsWith('dk_test_').min(40).optional(),
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
  
async function seedAdmin(prisma: PrismaClient) {
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
}

async function seedDevPartner(prisma: PrismaClient, apiKey: string) {
  const partner = await prisma.partner.upsert({
    where: { name: 'Dev Partner' },
    update: {},
    create: { name: 'Dev Partner' },
  });

  await prisma.apiKey.upsert({
    where: { keyHash: hashApiKey(apiKey) },
    update: {},
    create: {
      partnerId: partner.id,
      keyHash: hashApiKey(apiKey),
      lastFour: apiKey.slice(-4),
    },
  });

  console.log(`Dev partner ready: ${partner.name} (key ...${apiKey.slice(-4)})`);
}

try {
  await seedAdmin(prisma);

  if (env.NODE_ENV !== 'production' && seedEnv.DEV_PARTNER_API_KEY) {
    await seedDevPartner(prisma, seedEnv.DEV_PARTNER_API_KEY);
  }
} finally {
  await prisma.$disconnect();
}