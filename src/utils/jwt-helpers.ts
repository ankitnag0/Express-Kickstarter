// src/utils/jwt-helpers.ts
import { env } from '@config/env';
import { IUser } from '@modules/user/types'; // Make sure to import IUser
import jwt from 'jsonwebtoken';

// Function to generate Access Token
export const generateAccessToken = (user: IUser): string => {
  // Export the function
  return jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRATION,
  });
};

// Function to generate Refresh Token
export const generateRefreshToken = (user: IUser): string => {
  // Export the function
  return jwt.sign(
    { id: user._id, tokenType: 'refresh' }, //tokenType to differentiate
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRATION },
  );
};
