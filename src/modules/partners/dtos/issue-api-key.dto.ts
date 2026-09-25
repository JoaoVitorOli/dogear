import { z } from 'zod';

export const partnerIdParamsSchema = z.object({
  id: z.uuid(),
});

export const apiKeyResponseSchema = z.object({
  id: z.string(),
  apiKey: z.string(),
  lastFour: z.string(),
});

export type issueApiKeyDto = z.infer<typeof partnerIdParamsSchema>;
