import { EntitlementStatus, Prisma } from '../../generated/prisma/client.js';
import type { TransactionRunner } from '../../shared/database/database.types.js';
import type { UsersService } from '../users/users.service.js';
import type { GrantEntitlementDto } from './dtos/grant-entitlement.dto.js';
import { EntitlementAlreadyActiveError, EntitlementConflictError } from './entitlements.errors.js';
import type { EntitlementsRepository } from './entitlements.repository.js';

export class EntitlementsService {
  constructor(
    private readonly entitlementsRepository: EntitlementsRepository,
    private readonly usersService: UsersService,
    private readonly runInTransaction: TransactionRunner,
  ) {}

  async grant(partnerId: string, data: GrantEntitlementDto) {
    try {
      return await this.runInTransaction(async (tx) => {
        const user = await this.usersService.findOrCreatePending({ email: data.email, name: data.name || null }, tx);
        const existing = await this.entitlementsRepository.findByPartnerAndUser(partnerId, user.id, tx);

        if (existing?.status === EntitlementStatus.ACTIVE) {
          throw new EntitlementAlreadyActiveError();
        }

        const entitlement = existing
          ? await this.entitlementsRepository.reactivate(existing.id, data.externalCustomerId || null, tx)
          : await this.entitlementsRepository.create(
            { partnerId, userId: user.id, externalCustomerId: data.externalCustomerId || null },
            tx,
          );

        return {
          id: entitlement.id,
          status: entitlement.status,
          externalCustomerId: entitlement.externalCustomerId,
          grantedAt: entitlement.grantedAt,
          user: { id: user.id, email: user.email, status: user.status },
        };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new EntitlementConflictError();
      }
      throw error;
    }
  }
}