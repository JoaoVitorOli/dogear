import type { UserRole } from '../../../generated/prisma/client.js';

export interface TokenPayload {
  sub: string;
  role: UserRole;
}

export type TokenSigner = (payload: TokenPayload) => string;