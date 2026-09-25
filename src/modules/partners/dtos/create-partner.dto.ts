import { z } from 'zod';
import { PartnerStatus } from '../../../generated/prisma/enums.js';

export const createPartnerBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  requestsPerMinute: z.number().int().min(1).max(10_000).optional(),
});

export const partnerResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(PartnerStatus),
  requestsPerMinute: z.number(),
});

export type createPartnerDto = z.infer<typeof createPartnerBodySchema>;