import type { PrismaClient } from './generated/prisma/client.js';
import { AuthService } from './modules/auth/auth.service.js';
import type { TokenSigner } from './modules/auth/types/auth.types.js';
import { EntitlementsRepository } from './modules/entitlements/entitlements.repository.js';
import { EntitlementsService } from './modules/entitlements/entitlements.service.js';
import { PartnersRepository } from './modules/partners/partners.repository.js';
import { PartnersService } from './modules/partners/partners.service.js';
import { UsersRepository } from './modules/users/users.repository.js';
import { UsersService } from './modules/users/users.service.js';
import type { TransactionRunner } from './shared/database/database.types.js';

export interface ContainerDeps {
  prisma: PrismaClient;
  signToken: TokenSigner;
}

export function createContainer({ prisma, signToken }: ContainerDeps) {
  const usersRepository = new UsersRepository(prisma);
  const usersService = new UsersService(usersRepository);
  const authService = new AuthService(usersService, signToken);
  const partnersRepository = new PartnersRepository(prisma);
  const partnersService = new PartnersService(partnersRepository);
  const runInTransaction: TransactionRunner = (fn) => prisma.$transaction(fn);
  const entitlementsRepository = new EntitlementsRepository(prisma);
  const entitlementsService = new EntitlementsService(entitlementsRepository, usersService, runInTransaction); 

  return { usersService, authService, partnersService, entitlementsService };
}

export type Container = ReturnType<typeof createContainer>;