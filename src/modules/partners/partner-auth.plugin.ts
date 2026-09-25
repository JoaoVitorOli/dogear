import type { FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { InvalidApiKeyError } from './partners.errors.js';
import type { PartnersService } from './partners.service.js';
import type { AuthenticatedPartner } from './types/partners.types.js';

declare module 'fastify' {
  interface FastifyRequest {
    partner: AuthenticatedPartner;
  }
  interface FastifyInstance {
    authenticatePartner: (request: FastifyRequest) => Promise<void>;
  }
}

export interface PartnerAuthPluginOptions {
  partnersService: PartnersService;
}

export const partnerAuthPlugin = fp<PartnerAuthPluginOptions>(
  async (app, { partnersService }) => {
    app.decorateRequest('partner', undefined as unknown as AuthenticatedPartner);

    app.decorate('authenticatePartner', async (request: FastifyRequest) => {
      const apiKey = request.headers['x-api-key'];

      if (typeof apiKey !== 'string' || apiKey.length === 0) {
        throw new InvalidApiKeyError();
      }

      request.partner = await partnersService.authenticateApiKey(apiKey);
    });
  },
  { name: 'partner-auth' },
);