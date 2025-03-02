import { cache } from '@config/cache';
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

const CACHE_KEYS = {
  ALL_USERS: 'users:all',
};

// Function to generate Access Token
const generateAccessToken = (user: IUser): string => {
  return jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRATION,
  });
};

// Function to generate Refresh Token
const generateRefreshToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, tokenType: 'refresh' }, //tokenType to differentiate
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRATION },
  );
};

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

      await cache.invalidate(CACHE_KEYS.ALL_USERS);
      return user;
    },

    async signIn(
      input: SignInInput,
    ): Promise<{ accessToken: string; refreshToken: string }> {
      // Return both tokens
      const user = await userRepo.findUserByEmail(input.email);
      if (!user) throw new UnauthorizedError('Invalid email or password.');

      const isPasswordValid = await argon2.verify(
        user.password,
        input.password,
      );
      if (!isPasswordValid)
        throw new UnauthorizedError('Invalid email or password.');

      const accessToken = generateAccessToken(user); // Generate access token
      const refreshToken = generateRefreshToken(user); // Generate refresh token

      return { accessToken, refreshToken }; // Return both tokens
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

      await cache.invalidate(CACHE_KEYS.ALL_USERS);
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

      await cache.invalidate(CACHE_KEYS.ALL_USERS);
      return updatedUser;
    },

    async getAllUsers(): Promise<Pick<IUser, 'name' | 'email' | 'role'>[]> {
      const cachedUsers = await cache.get<
        Pick<IUser, 'name' | 'email' | 'role'>[]
      >(CACHE_KEYS.ALL_USERS);
      if (cachedUsers) return cachedUsers;

      const users = await userRepo.findAllUsers();
      await cache.set(CACHE_KEYS.ALL_USERS, users);
      return users;
    },

    async getUsersPaginated(
      page: number,
      limit: number,
    ): Promise<{
      users: Pick<IUser, 'name' | 'email' | 'role'>[];
      total: number;
    }> {
      return await userRepo.findUsersPaginated(page, limit);
    },
  };
};
