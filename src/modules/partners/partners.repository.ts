import type { Partner, PrismaClient } from '../../generated/prisma/client.js';
import type { createPartnerDto } from './dtos/create-partner.dto.js';

export class PartnersRepository {
  constructor (private readonly prisma: PrismaClient) {}

  create(props: createPartnerDto): Promise<Partner> {
    return this.prisma.partner.create({ data: { name: props.name, requestsPerMinute: props.requestsPerMinute || 100 } });
  }

  findByName(name: string): Promise<Partner | null> {
    return this.prisma.partner.findUnique({ where: { name } });
  }

  findById(id: string): Promise<Partner | null> {
    return this.prisma.partner.findUnique({ where: { id } });
  }

  createApiKey(data: { partnerId: string; keyHash: string; lastFour: string }) {
    return this.prisma.apiKey.create({ data });
  }

  findApiKeyByHash(keyHash: string) {
    return this.prisma.apiKey.findUnique({
      where: { keyHash },
      include: { partner: true },
    });
  }

  touchApiKey(id: string) {
    return this.prisma.apiKey.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });
  }
}