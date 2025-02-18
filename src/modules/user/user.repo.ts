import { Types } from 'mongoose';
import { User, IUser, Role } from './user.model';

// Interfaces for user creation and update
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

// Type for the repository
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
