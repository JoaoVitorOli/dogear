import { PartnerStatus, Prisma } from '../../generated/prisma/client.js';
import { generateApiKey, hashApiKey } from '../../shared/security/api-key.js';
import type { createPartnerDto } from './dtos/create-partner.dto.js';
import type { issueApiKeyDto } from './dtos/issue-api-key.dto.js';
import { InvalidApiKeyError, PartnerNameTakenError, PartnerNotFoundError } from './partners.errors.js';
import type { PartnersRepository } from './partners.repository.js';
import type { AuthenticatedPartner } from './types/partners.types.js';

export class PartnersService {
  constructor(private readonly partnersRepository: PartnersRepository) {}

  async create(props: createPartnerDto) {
    try {
      return await this.partnersRepository.create(props);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new PartnerNameTakenError();
      }
      throw error;
    }
  }

  async issueApiKey(data: issueApiKeyDto) {
    const partnerId = data.id;
    const partner = await this.partnersRepository.findById(partnerId);

    if (!partner) {
      throw new PartnerNotFoundError();
    }

    const { apiKey, keyHash, lastFour } = generateApiKey();
    const record = await this.partnersRepository.createApiKey({ partnerId, keyHash, lastFour });

    return { id: record.id, apiKey, lastFour };
  }

  async authenticateApiKey(apiKey: string): Promise<AuthenticatedPartner> {
    const record = await this.partnersRepository.findApiKeyByHash(hashApiKey(apiKey));

    if (!record || record.revokedAt || record.partner.status !== PartnerStatus.ACTIVE) {
      throw new InvalidApiKeyError();
    }

    const oneMinuteAgo = Date.now() - 60_000;
    if (!record.lastUsedAt || record.lastUsedAt.getTime() < oneMinuteAgo) {
      await this.partnersRepository.touchApiKey(record.id);
    }

    return {
      id: record.partner.id,
      name: record.partner.name,
      requestsPerMinute: record.partner.requestsPerMinute,
    };
  }
}