import { Types } from 'mongoose';

import {
  CreateUserInput,
  IUser,
  Role,
  UpdateUserInput,
  UserRepository,
} from './types';
import { User } from './user.model';

// Factory function to create the user repository
export const createUserRepository = (): UserRepository => {
  return {
    async createUser(userData: CreateUserInput): Promise<IUser> {
      const user = new User({
        ...userData,
        role: userData.role ?? Role.USER,
      });
      return await user.save();
    },

    async updateUserById(
      userId: Types.ObjectId,
      updateData: UpdateUserInput,
    ): Promise<IUser | null> {
      return await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).exec();
    },

    async findUserById(userId: Types.ObjectId): Promise<IUser | null> {
      return await User.findById(userId).exec();
    },

    async findUserByEmail(email: string): Promise<IUser | null> {
      return await User.findOne({ email }).exec();
    },

    async findAllUsers(): Promise<Pick<IUser, 'name' | 'email' | 'role'>[]> {
      return await User.find({}, { name: 1, email: 1, role: 1, _id: 0 }).exec();
    },
  };
};
