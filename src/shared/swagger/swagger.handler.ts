import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

export async function registerSwagger(app: FastifyInstance): Promise<void> {
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'Dogear API',
        description: 'Backend of a digital reading platform, with a partner API for B2B integrations.',
        version: '1.0.0',
      },
      tags: [
        { name: 'auth', description: 'Login and account activation' },
        { name: 'users', description: 'Current user' },
        { name: 'admin', description: 'Partner and catalog management (admin only)' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          partnerApiKey: { type: 'apiKey', in: 'header', name: 'x-api-key' },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });
}