import type { PrismaClient } from './generated/prisma/client.js';
import { AuthService } from './modules/auth/auth.service.js';
import type { TokenSigner } from './modules/auth/types/auth.types.js';
import { PartnersRepository } from './modules/partners/partners.repository.js';
import { PartnersService } from './modules/partners/partners.service.js';
import { UsersRepository } from './modules/users/users.repository.js';
import { UsersService } from './modules/users/users.service.js';

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

  return { usersService, authService, partnersService };
}

export type Container = ReturnType<typeof createContainer>;