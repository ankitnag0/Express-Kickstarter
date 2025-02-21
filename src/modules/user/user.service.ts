import { env } from '@config/env';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '@lib/CustomError';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

import {
  IUser,
  SignInInput,
  SignUpInput,
  UpdateNameOrPasswordInput,
  UpdateRoleInput,
  UserRepository,
  UserService,
} from './types';

export const createUserService = (userRepo: UserRepository): UserService => {
  return {
    async signUp(input: SignUpInput): Promise<IUser> {
      const existingUser = await userRepo.findUserByEmail(input.email);
      if (existingUser) throw new ConflictError('User already exists.');

      const hashedPassword = await argon2.hash(input.password);
      const user = await userRepo.createUser({
        ...input,
        password: hashedPassword,
      });

      return user;
    },

    async signIn(input: SignInInput): Promise<string> {
      const user = await userRepo.findUserByEmail(input.email);
      if (!user) throw new UnauthorizedError('Invalid email or password.');

      const isPasswordValid = await argon2.verify(
        user.password,
        input.password,
      );
      if (!isPasswordValid)
        throw new UnauthorizedError('Invalid email or password.');

      const token = jwt.sign(
        { id: user._id, role: user.role },
        env.JWT_SECRET,
        {
          expiresIn: env.JWT_EXPIRATION,
        },
      );

      return token;
    },

    async updateNameOrPassword(
      userId: string,
      input: UpdateNameOrPasswordInput,
    ): Promise<IUser | null> {
      const updateData: UpdateNameOrPasswordInput = {};

      if (input.name) updateData.name = input.name;
      if (input.password) {
        updateData.password = await argon2.hash(input.password);
      }

      const updatedUser = await userRepo.updateUserById(
        new Types.ObjectId(userId),
        updateData,
      );
      if (!updatedUser) throw new NotFoundError('User not found.');

      return updatedUser;
    },

    async updateRole(
      userId: string,
      input: UpdateRoleInput,
    ): Promise<IUser | null> {
      const updatedUser = await userRepo.updateUserById(
        new Types.ObjectId(userId),
        { role: input.role },
      );
      if (!updatedUser) throw new NotFoundError('User not found.');

      return updatedUser;
    },

    async getAllUsers(): Promise<Pick<IUser, 'name' | 'email' | 'role'>[]> {
      return await userRepo.findAllUsers();
    },
  };
};
