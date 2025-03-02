import { ParsedQs } from 'qs';
import { z } from 'zod';

import { Role } from './user.types';

export const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const updateNameOrPasswordSchema = z.object({
  name: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
});

export const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const updateRoleParamsSchema = z.object({
  id: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: 'Invalid ObjectId',
  }),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
});

export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type UpdateNameOrPasswordData = z.infer<
  typeof updateNameOrPasswordSchema
>;

export type UpdateRoleData = z.infer<typeof updateRoleSchema>;
export type UpdateRoleParams = z.infer<typeof updateRoleParamsSchema>;

export type PaginationQuery = z.infer<typeof paginationSchema> & ParsedQs;
