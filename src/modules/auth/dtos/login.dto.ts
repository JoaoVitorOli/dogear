import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
});

export type LoginDto = z.infer<typeof loginBodySchema>;