import { Types } from 'mongoose';
import { User, IUser, Role } from './user.model';

// Interface for creating a user
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: IUser['role']; // Optional, defaults to 'user' in the schema
}

// Interface for updating a user
export interface UpdateUserInput {
  name?: string;
  role?: IUser['role'];
  password?: string;
}

export class UserRepository {
  // Create a new user
  async createUser(userData: CreateUserInput): Promise<IUser> {
    const user = new User({
      ...userData,
      role: userData.role ?? Role.USER, // Default to 'user' if role is not provided
    });
    return await user.save();
  }

  // Update a user by ID
  async updateUserById(
    userId: Types.ObjectId,
    updateData: UpdateUserInput,
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).exec();
  }

  // Find a user by ID
  async findUserById(userId: Types.ObjectId): Promise<IUser | null> {
    return await User.findById(userId).exec();
  }

  // Find a user by email
  async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).exec();
  }

  // Find all users (get names only)
  async findAllUsers(): Promise<Pick<IUser, 'name' | 'email' | 'role'>[]> {
    return await User.find({}, { name: 1, email: 1, role: 1, _id: 0 }).exec();
  }
}
