import { Document, model, Schema, Types } from 'mongoose';

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

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);

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
