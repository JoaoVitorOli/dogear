import { z } from 'zod';
import { EntitlementStatus, UserStatus } from '../../../generated/prisma/enums.js';

export const grantEntitlementBodySchema = z.object({
  email: z.email().max(255),
  name: z.string().trim().min(1).max(120).optional(),
  externalCustomerId: z.string().trim().min(1).max(120).optional(),
});

export const entitlementResponseSchema = z.object({
  id: z.string(),
  status: z.enum(EntitlementStatus),
  externalCustomerId: z.string().nullable(),
  grantedAt: z.date(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    status: z.enum(UserStatus),
  }),
});

export type GrantEntitlementDto = z.infer<typeof grantEntitlementBodySchema>;