import { Document, Types } from 'mongoose';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: IUser['role'];
}

export interface UpdateUserInput {
  name?: string;
  role?: IUser['role'];
  password?: string;
}
