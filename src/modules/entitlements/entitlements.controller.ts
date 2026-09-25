import type { FastifyPluginAsync } from 'fastify';

export const entitlementsController: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', app.authenticatePartner);
  app.addHook('onRoute', (route) => {
    route.schema = { ...route.schema, tags: ['partners'], security: [{ partnerApiKey: [] }] };
  });

  app.get('/whoami', async (request) => request.partner);
};