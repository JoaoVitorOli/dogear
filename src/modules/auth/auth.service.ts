import { UserStatus } from '../../generated/prisma/client.js';
import { verifyPassword } from '../../shared/security/password.js';
import type { UsersService } from '../users/users.service.js';
import { InvalidCredentialsError } from './auth.errors.js';
import type { TokenSigner } from './types/auth.types.js';

export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly signToken: TokenSigner,
  ) {}

  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user || user.status !== UserStatus.ACTIVE || !user.passwordHash) {
      throw new InvalidCredentialsError();
    }

    const isValid = await verifyPassword(user.passwordHash, password);

    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    return {
      accessToken: this.signToken({ sub: user.id, role: user.role }),
    };
  }
}