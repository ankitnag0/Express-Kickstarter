import { UnauthorizedError } from '@lib/CustomError'; // Import UnauthorizedError if you are throwing custom errors
import { generateAccessToken, generateRefreshToken } from '@utils/jwt-helpers'; // Import token helpers
import { Request, Response } from 'express';

import {
  IUser,
  PaginationQuery,
  SignInData,
  SignUpData,
  UpdateNameOrPasswordData,
  UpdateRoleData,
  UpdateRoleParams,
  UserController,
  UserService,
} from './types';

export const createUserController = (
  userService: UserService,
): UserController => {
  return {
    async signUp(req: Request<unknown, unknown, SignUpData>, res: Response) {
      const { name, email, password } = req.body;
      const user = await userService.signUp({ name, email, password });
      res.success(user, 201, 'User registered successfully.');
    },

    async signIn(req: Request<unknown, unknown, SignInData>, res: Response) {
      const { email, password } = req.body;
      const { accessToken, refreshToken } = await userService.signIn({
        email,
        password,
      }); // Get both tokens
      res.success({ accessToken, refreshToken }, 200, 'Login successful.'); // Send both tokens in response
    },

    async updateNameOrPassword(
      req: Request<unknown, unknown, UpdateNameOrPasswordData>,
      res: Response,
    ) {
      const userId = req.user?.id as string;
      const { name, password } = req.body;
      const updatedUser = await userService.updateNameOrPassword(userId, {
        name,
        password,
      });
      res.success(updatedUser, 200, 'Profile updated successfully.');
    },

    async updateRole(
      req: Request<UpdateRoleParams, unknown, UpdateRoleData>,
      res: Response,
    ) {
      const userId = req.params.id;
      const { role } = req.body;
      const updatedUser = await userService.updateRole(userId, { role });
      res.success(updatedUser, 200, 'User role updated successfully.');
    },

    async getAllUsers(req: Request, res: Response) {
      const users = await userService.getAllUsers();
      res.success(users, 200, 'Users retrieved successfully.');
    },

    async getPaginatedUsers(
      req: Request<unknown, unknown, unknown, PaginationQuery>,
      res: Response,
    ) {
      const { page, limit } = req.query;
      const { users, total } = await userService.getUsersPaginated(page, limit);

      res.success(
        { users, page, limit, total },
        200,
        'Paginated users retrieved successfully.',
      );
    },

    // Google OAuth callback handler
    async googleOAuthCallback(req: Request, res: Response) {
      const user = req.user as IUser; // Type assertion as googleAuth middleware should ensure user is present

      if (!user) {
        throw new UnauthorizedError('Google OAuth authentication failed.'); // Handle failure case
      }

      // Generate JWT access and refresh tokens for the Google-authenticated user
      const accessToken = generateAccessToken(user); // Call generateAccessToken with user only
      const refreshToken = generateRefreshToken(user); // Call generateRefreshToken with user only

      // Respond with tokens and success message using res.success
      res.success(
        { accessToken, refreshToken },
        200,
        'Google login successful.',
      );
    },
  };
};
