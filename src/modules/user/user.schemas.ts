import { z } from 'zod';
import { Role } from './user.model'; // Import your Role enum

// Zod schemas
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
  role: z.nativeEnum(Role), // Ensure role is one of the enum values
});

// Typing Zod schemas
export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type UpdateNameOrPasswordData = z.infer<
  typeof updateNameOrPasswordSchema
>;
export type UpdateRoleData = z.infer<typeof updateRoleSchema>;

export interface UpdateRoleParams {
  id: string;
}
