import { authMiddleware } from '@middlewares/authenticator';
import { rbacMiddleware } from '@middlewares/role-enforcer';
import { validate } from '@middlewares/zod-validator';
import { Router } from 'express';

import {
  Role,
  signInSchema,
  signUpSchema,
  updateNameOrPasswordSchema,
  updateRoleParamsSchema,
  updateRoleSchema,
} from './types';
import { createUserController } from './user.controller';
import { createUserRepository } from './user.repo';
import { createUserService } from './user.service';

const userRepo = createUserRepository();
const userService = createUserService(userRepo);
const userController = createUserController(userService);

const router = Router();

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
