import { z } from 'zod';
import { UserRole, UserStatus } from '../../../generated/prisma/client.js';

export const userResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().nullable(),
  role: z.enum(UserRole),
  status: z.enum(UserStatus),
});

export type UserResponseDto = z.infer<typeof userResponseSchema>;