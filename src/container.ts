import type { PrismaClient } from './generated/prisma/client.js';
import { AuthService } from './modules/auth/auth.service.js';
import type { TokenSigner } from './modules/auth/types/auth.types.js';
import { UsersRepository } from './modules/user/users.repository.js';
import { UsersService } from './modules/user/users.service.js';

export interface ContainerDeps {
  prisma: PrismaClient;
  signToken: TokenSigner;
}

export function createContainer({ prisma, signToken }: ContainerDeps) {
  const usersRepository = new UsersRepository(prisma);
  const usersService = new UsersService(usersRepository);
  const authService = new AuthService(usersService, signToken);

  return { usersService, authService };
}

export type Container = ReturnType<typeof createContainer>;