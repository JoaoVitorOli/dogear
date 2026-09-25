import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client.js';

export interface PrismaConnectionOptions {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  allowPublicKeyRetrieval: boolean;
}

export function createPrismaClient(opts: PrismaConnectionOptions): PrismaClient {
  const adapter = new PrismaMariaDb({ ...opts, connectionLimit: 10, acquireTimeout: 5000 });
  return new PrismaClient({ adapter });
}