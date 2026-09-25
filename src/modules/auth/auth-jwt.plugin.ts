import fastifyJwt from '@fastify/jwt';
import type { FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import type { UserRole } from '../../generated/prisma/client.js';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors/app-errors.js';
import type { TokenPayload } from './types/auth.types.js';

type PreHandler = (request: FastifyRequest) => Promise<void>;

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: TokenPayload;
    user: TokenPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: PreHandler;
    requireRole: (role: UserRole) => PreHandler;
  }
}

export interface AuthJwtPluginOptions {
  secret: string;
}

export const authJwtPlugin = fp<AuthJwtPluginOptions>(
  async (app, opts) => {
    await app.register(fastifyJwt, {
      secret: opts.secret,
      sign: { expiresIn: '1h' },
    });

    app.decorate('authenticate', async (request: FastifyRequest) => {
      try {
        await request.jwtVerify();
      } catch {
        throw new UnauthorizedError('Invalid or missing token');
      }
    });

    app.decorate('requireRole', (role: UserRole) => async (request: FastifyRequest) => {
      if (request.user.role !== role) {
        throw new ForbiddenError('Insufficient permissions');
      }
    });
  },
  { name: 'auth-jwt' },
);