import type { Prisma, PrismaClient } from '../../generated/prisma/client.js';

export type DbClient = PrismaClient | Prisma.TransactionClient;

export type TransactionRunner = <T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) => Promise<T>;