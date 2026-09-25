import type { User } from '../../generated/prisma/client.js';
import type { DbClient } from '../../shared/database/database.types.js';
import { UserNotFoundError } from './users.errors.js';
import type { UsersRepository } from './users.repository.js';

export class UsersService {
  constructor (private readonly usersRepository: UsersRepository) {}

  async getById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError();
    }

    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email.trim().toLowerCase());
  }

  findOrCreatePending(data: { email: string; name: string | null }, db?: DbClient): Promise<User> {
    return this.usersRepository.upsertPending(
      { email: data.email.trim().toLowerCase(), name: data.name },
      db,
    );
  }
}