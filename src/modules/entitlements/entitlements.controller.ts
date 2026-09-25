import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { entitlementResponseSchema, grantEntitlementBodySchema } from './dtos/grant-entitlement.dto.js';
import type { EntitlementsService } from './entitlements.service.js';

export interface EntitlementsControllerOptions {
  entitlementsService: EntitlementsService;
}

export const entitlementsController: FastifyPluginAsync<EntitlementsControllerOptions> = async (app, { entitlementsService }) => {
  app.addHook('preHandler', app.authenticatePartner);
  app.addHook('onRoute', (route) => {
    route.schema = { ...route.schema, tags: ['partners'], security: [{ partnerApiKey: [] }] };
  });

  const router = app.withTypeProvider<ZodTypeProvider>();

  router.post('/', {
    schema: {
      body: grantEntitlementBodySchema,
      response: { 201: entitlementResponseSchema },
    },
  }, async (request, reply) => {
    const entitlement = await entitlementsService.grant(request.partner.id, request.body);
    return reply.status(201).send(entitlement);
  });
};