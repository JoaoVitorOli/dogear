import type { PrismaClient } from '../../generated/prisma/client.js';
import { EntitlementStatus } from '../../generated/prisma/enums.js';
import type { DbClient } from '../../shared/database/database.types.js';

export class EntitlementsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByPartnerAndUser(partnerId: string, userId: string, db: DbClient = this.prisma) {
    return db.entitlement.findUnique({ where: { partnerId_userId: { partnerId, userId } } });
  }

  create(data: { partnerId: string; userId: string; externalCustomerId: string | null }, db: DbClient = this.prisma) {
    return db.entitlement.create({ data });
  }

  reactivate(id: string, externalCustomerId: string | null, db: DbClient = this.prisma) {
    return db.entitlement.update({
      where: { id },
      data: { status: EntitlementStatus.ACTIVE, revokedAt: null, grantedAt: new Date(), externalCustomerId },
    });
  }
}