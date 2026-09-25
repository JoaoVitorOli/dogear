import type { PrismaClient, User } from '../../generated/prisma/client.js';
import type { DbClient } from '../../shared/database/database.types.js';

export class UsersRepository {
  constructor (private readonly prisma: PrismaClient) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  upsertPending(data: { email: string; name: string | null }, db: DbClient = this.prisma): Promise<User> {
    return db.user.upsert({
      where: { email: data.email },
      create: { email: data.email, name: data.name },
      update: {},
    });
  }
}