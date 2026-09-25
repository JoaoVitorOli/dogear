import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { createContainer } from './container.js';
import { authJwtPlugin } from './modules/auth/auth-jwt.plugin.js';
import { usersController } from './modules/users/users.controller.js';
import type { Env } from './shared/config/env.js';
import { prismaPlugin } from './shared/database/prisma.plugin.js';
import { registerErrorHandler } from './shared/http/error.handler.js';
import { authController } from './modules/auth/auth.controller.js';
import { partnersController } from './modules/partners/partner.controller.js';
import { registerSwagger } from './shared/swagger/swagger.handler.js';

export async function buildApp(config: Env) {
  const app = Fastify({
    logger: config.NODE_ENV !== 'test',
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  registerErrorHandler(app);
  await registerSwagger(app);

  await app.register(prismaPlugin, {
    host: config.DATABASE_HOST,
    port: config.DATABASE_PORT,
    user: config.DATABASE_USER,
    password: config.DATABASE_PASSWORD,
    database: config.DATABASE_NAME,
  });
  await app.register(authJwtPlugin, { secret: config.JWT_SECRET });

  const container = createContainer({ 
    prisma: app.prisma,
    signToken: (payload) => app.jwt.sign(payload), 
  });

  app.get('/health', async () => {
    await app.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  });

  await app.register(usersController, {
    prefix: '/v1',
    usersService: container.usersService,
  });

  await app.register(authController, {
    prefix: '/v1/auth',
    authService: container.authService,
  });

  await app.register(partnersController, {
    prefix: '/v1/admin/partners',
    partnersService: container.partnersService,
  });

  return app;
}