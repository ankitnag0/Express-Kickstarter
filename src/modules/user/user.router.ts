import { Router } from 'express';

import { authMiddleware } from '../../middlewares/authenticator';
import { rbacMiddleware } from '../../middlewares/role-enforcer';
import { validate } from '../../middlewares/zod-validator';
import { Role } from './types';
import {
  signInSchema,
  signUpSchema,
  updateNameOrPasswordSchema,
  updateRoleParamsSchema,
  updateRoleSchema,
} from './types';
import { createUserController } from './user.controller';
import { createUserRepository } from './user.repo';
import { createUserService } from './user.service';

// Create instances of repo, service, and controller
const userRepo = createUserRepository();
const userService = createUserService(userRepo);
const userController = createUserController(userService);

const router = Router();

// Define routes with middlewares
router.post('/signup', validate(signUpSchema), userController.signUp);
router.post('/signin', validate(signInSchema), userController.signIn);
router.patch(
  '/update',
  authMiddleware,
  validate(updateNameOrPasswordSchema),
  userController.updateNameOrPassword,
);
router.patch(
  '/role/:id',
  authMiddleware,
  rbacMiddleware([Role.ADMIN]),
  validate(updateRoleSchema),
  validate(updateRoleParamsSchema, 'params'),
  userController.updateRole,
);
router.get(
  '/users',
  authMiddleware,
  rbacMiddleware([Role.ADMIN]),
  userController.getAllUsers,
);

export default router;
