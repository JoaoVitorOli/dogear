import type { FastifyPluginAsync } from 'fastify';
import type { PartnersService } from './partners.service.js';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createPartnerBodySchema, partnerResponseSchema } from './dtos/create-partner.dto.js';
import { partnerIdParamsSchema, apiKeyResponseSchema } from './dtos/issue-api-key.dto.js';

export interface PartnersControllerOptions {
  partnersService: PartnersService;
}

export const partnersController: FastifyPluginAsync<PartnersControllerOptions> = async (app, { partnersService }) => {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', app.requireRole('ADMIN'));

  const router = app.withTypeProvider<ZodTypeProvider>();

  router.post('/', {
    schema: {
      tags: ['admin'],
      body: createPartnerBodySchema,
      response: { 201: partnerResponseSchema },
    },
  }, async (request, reply) => {
    const partner = await partnersService.create(request.body);
    return reply.status(201).send(partner);
  });

  router.post('/:id/api-keys', {
    schema: {
      tags: ['admin'],
      params: partnerIdParamsSchema,
      response: { 201: apiKeyResponseSchema },
    },
  }, async (request, reply) => {
    const apiKey = await partnersService.issueApiKey({ id: request.params.id });
    return reply.status(201).send(apiKey);
  });
};