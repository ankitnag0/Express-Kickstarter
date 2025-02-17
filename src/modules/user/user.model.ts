import { Schema, model, Document, Types } from 'mongoose';

// Define the Role enum
export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

// Define the User interface
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

// Define the User schema
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
  },
  { timestamps: true }, // Automatically adds `createdAt` and `updatedAt` fields
);

// Create and export the User model
export const User = model<IUser>('User', userSchema);
