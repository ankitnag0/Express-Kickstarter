import { model, models, Schema } from 'mongoose';

import { IUser, Role } from './types';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
  },
  { timestamps: true },
);

export const User = models.User || model<IUser>('User', userSchema);
