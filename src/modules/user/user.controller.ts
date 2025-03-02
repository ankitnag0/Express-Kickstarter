import { Request, Response } from 'express';

import {
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
  };
};
