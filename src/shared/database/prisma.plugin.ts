import fp from 'fastify-plugin';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client.js';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export interface PrismaPluginOptions {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export const prismaPlugin = fp<PrismaPluginOptions>(
  async (app, opts) => {
    const adapter = new PrismaMariaDb({
      ...opts,
      connectionLimit: 10,
      allowPublicKeyRetrieval: true,
    });
    const prisma = new PrismaClient({ adapter });

    await prisma.$connect();

    app.decorate('prisma', prisma);

    app.addHook('onClose', async () => {
      await prisma.$disconnect();
    });
  },
  { name: 'prisma' },
);