import { Request, Response } from 'express';
import { Types } from 'mongoose';

import {
  SignInData,
  SignUpData,
  UpdateNameOrPasswordData,
  UpdateRoleData,
  UpdateRoleParams,
} from './user.schemas';
import {
  CreateUserInput,
  IUser,
  SignInInput,
  SignUpInput,
  UpdateNameOrPasswordInput,
  UpdateRoleInput,
  UpdateUserInput,
} from './user.types';

export type UserRepository = {
  createUser(userData: CreateUserInput): Promise<IUser>;
  updateUserById(
    userId: Types.ObjectId,
    updateData: UpdateUserInput,
  ): Promise<IUser | null>;
  findUserById(userId: Types.ObjectId): Promise<IUser | null>;
  findUserByEmail(email: string): Promise<IUser | null>;
  findAllUsers(): Promise<Pick<IUser, 'name' | 'email' | 'role'>[]>;
};

export type UserService = {
  signUp(input: SignUpInput): Promise<IUser>;
  signIn(input: SignInInput): Promise<string>;
  updateNameOrPassword(
    userId: string,
    input: UpdateNameOrPasswordInput,
  ): Promise<IUser | null>;
  updateRole(userId: string, input: UpdateRoleInput): Promise<IUser | null>;
  getAllUsers(): Promise<Pick<IUser, 'name' | 'email' | 'role'>[]>;
};

export type UserController = {
  signUp(
    req: Request<unknown, unknown, SignUpData>,
    res: Response,
  ): Promise<void>;
  signIn(
    req: Request<unknown, unknown, SignInData>,
    res: Response,
  ): Promise<void>;
  updateNameOrPassword(
    req: Request<unknown, unknown, UpdateNameOrPasswordData>,
    res: Response,
  ): Promise<void>;
  updateRole(
    req: Request<UpdateRoleParams, unknown, UpdateRoleData>,
    res: Response,
  ): Promise<void>;
  getAllUsers(req: Request, res: Response): Promise<void>;
};
