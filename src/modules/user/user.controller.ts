import { Request, Response } from 'express';
import { UserService } from './user.service';
import { createController } from 'awilix-express';
import { validate } from '../../middlewares/zod-validator';
import { authMiddleware } from '../../middlewares/authenticator';
import { rbacMiddleware } from '../../middlewares/role-enforcer';
import { Role } from './user.model';
import {
  signUpSchema,
  signInSchema,
  updateNameOrPasswordSchema,
  updateRoleSchema,
  UpdateRoleParams,
  SignUpData,
  SignInData,
  UpdateNameOrPasswordData,
  UpdateRoleData,
} from './user.schemas';

class UserController {
  constructor(private userService: UserService) {}

  async signUp(req: Request<unknown, unknown, SignUpData>, res: Response) {
    const { name, email, password } = req.body;
    const user = await this.userService.signUp({ name, email, password });
    res.success(user, 201, 'User registered successfully.');
  }

  async signIn(req: Request<unknown, unknown, SignInData>, res: Response) {
    const { email, password } = req.body;
    const token = await this.userService.signIn({ email, password });
    res.success({ token }, 200, 'Login successful.');
  }

  async updateNameOrPassword(
    req: Request<unknown, unknown, UpdateNameOrPasswordData>,
    res: Response,
  ) {
    const userId = req.user?.id as string;
    const { name, password } = req.body;
    const updatedUser = await this.userService.updateNameOrPassword(userId, {
      name,
      password,
    });
    res.success(updatedUser, 200, 'Profile updated successfully.');
  }

  async updateRole(
    req: Request<UpdateRoleParams, unknown, UpdateRoleData>,
    res: Response,
  ) {
    const userId = req.params.id;
    const { role } = req.body;
    const updatedUser = await this.userService.updateRole(userId, { role });
    res.success(updatedUser, 200, 'User role updated successfully.');
  }

  async getAllUsers(req: Request<unknown, unknown, unknown>, res: Response) {
    const users = await this.userService.getAllUsers();
    res.success(users, 200, 'Users retrieved successfully.');
  }
}

export default createController(UserController)
  .prefix('/user')
  .post('/signup', 'signUp', { before: [validate(signUpSchema)] })
  .post('/signin', 'signIn', { before: [validate(signInSchema)] })
  .patch('/update', 'updateNameOrPassword', {
    before: [authMiddleware, validate(updateNameOrPasswordSchema)],
  })
  .patch('/role/:id', 'updateRole', {
    before: [
      authMiddleware,
      rbacMiddleware([Role.ADMIN]),
      validate(updateRoleSchema),
    ],
  })
  .get('/', 'getAllUsers', {
    before: [authMiddleware, rbacMiddleware([Role.ADMIN])],
  });
