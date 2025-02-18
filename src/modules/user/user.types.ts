import { Role } from './user.model';

// Interfaces for request body
export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface UpdateNameOrPasswordInput {
  name?: string;
  password?: string;
}

export interface UpdateRoleInput {
  role: Role;
}
