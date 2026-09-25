import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { userResponseSchema } from './dtos/user-response.dto.js';
import type { UsersService } from './users.service.js';

export interface UsersControllerOptions {
  usersService: UsersService;
}

export const usersController: FastifyPluginAsync<UsersControllerOptions> = async (app, { usersService }) => {
  const router = app.withTypeProvider<ZodTypeProvider>();

  router.get('/me', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['users'],
      response: { 200: userResponseSchema },
    },
  }, async (request) => {
    return usersService.getById(request.user.sub);
  });
};

export const usersPlugin: FastifyPluginAsync<UsersControllerOptions> = async (app, opts) => {
  await app.register(usersController, { usersService: opts.usersService });
};