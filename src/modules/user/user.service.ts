import { UserRepository } from './user.repo';
import { IUser } from './user.model';
import {
  SignUpInput,
  SignInInput,
  UpdateNameOrPasswordInput,
  UpdateRoleInput,
} from './user.types';
import argon2 from 'argon2';
import { env } from '../../config/env';
import jwt from 'jsonwebtoken';
import {
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../../lib/CustomError';
import { Types } from 'mongoose';

// User service class
export class UserService {
  constructor(private userRepo: UserRepository) {}

  // Sign up a new user
  async signUp(input: SignUpInput): Promise<IUser> {
    // Check if user already exists
    const existingUser = await this.userRepo.findUserByEmail(input.email);
    if (existingUser) throw new ConflictError('User already exists.');

    // Hash the password
    const hashedPassword = await argon2.hash(input.password);

    // Create new user
    const user = await this.userRepo.createUser({
      ...input,
      password: hashedPassword,
    });

    return user;
  }

  // Sign in a user
  async signIn(input: SignInInput): Promise<string> {
    const user = await this.userRepo.findUserByEmail(input.email);
    if (!user) throw new UnauthorizedError('Invalid email or password.');

    // Verify password
    const isPasswordValid = await argon2.verify(user.password, input.password);
    if (!isPasswordValid)
      throw new UnauthorizedError('Invalid email or password.');

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRATION,
    });

    return token;
  }

  // Update user name or password
  async updateNameOrPassword(
    userId: string,
    input: UpdateNameOrPasswordInput,
  ): Promise<IUser | null> {
    const updateData: UpdateNameOrPasswordInput = {};

    if (input.name) updateData.name = input.name;
    if (input.password) {
      // Hash the new password
      updateData.password = await argon2.hash(input.password);
    }

    const updatedUser = await this.userRepo.updateUserById(
      new Types.ObjectId(userId),
      updateData,
    );

    if (!updatedUser) throw new NotFoundError('User not found.');

    return updatedUser;
  }

  // Update user role (admin only)
  async updateRole(
    userId: string,
    input: UpdateRoleInput,
  ): Promise<IUser | null> {
    const updatedUser = await this.userRepo.updateUserById(
      new Types.ObjectId(userId),
      {
        role: input.role,
      },
    );

    if (!updatedUser) throw new NotFoundError('User not found.');

    return updatedUser;
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<Pick<IUser, 'name' | 'email' | 'role'>[]> {
    return await this.userRepo.findAllUsers();
  }
}
