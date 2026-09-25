import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import type { AuthService } from './auth.service.js';
import { loginBodySchema, loginResponseSchema } from './dtos/login.dto.js';

export interface AuthControllerOptions {
  authService: AuthService;
}

export const authController: FastifyPluginAsync<AuthControllerOptions> = async (app, { authService }) => {
  const router = app.withTypeProvider<ZodTypeProvider>();

  router.post('/login', {
    schema: {
      tags: ['auth'],
      body: loginBodySchema,
      response: { 200: loginResponseSchema },
    },
  }, async (request) => {
    return authService.login(request.body.email, request.body.password);
  });
};