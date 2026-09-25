import { Prisma } from '../../generated/prisma/client.js';
import { generateApiKey } from '../../shared/security/api-key.js';
import type { createPartnerDto } from './dtos/create-partner.dto.js';
import type { issueApiKeyDto } from './dtos/issue-api-key.dto.js';
import { PartnerNameTakenError, PartnerNotFoundError } from './partners.errors.js';
import type { PartnersRepository } from './partners.repository.js';

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
}