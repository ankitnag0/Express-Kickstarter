import { jwtAuth } from '@config/passport'; // Import jwtAuth from passport config
import { rbacMiddleware } from '@middlewares/role-enforcer';
import { validate } from '@middlewares/zod-validator';
import { Router } from 'express';

import {
  paginationSchema,
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
  jwtAuth(), // Use passport JWT auth middleware
  validate(updateNameOrPasswordSchema),
  userController.updateNameOrPassword,
);
router.patch(
  '/role/:id',
  jwtAuth(), // Use passport JWT auth middleware
  rbacMiddleware([Role.ADMIN]),
  validate(updateRoleSchema),
  validate(updateRoleParamsSchema, 'params'),
  userController.updateRole,
);
router.get(
  '/users',
  jwtAuth(), // Use passport JWT auth middleware
  rbacMiddleware([Role.ADMIN]),
  userController.getAllUsers,
);
router.get(
  '/paginated',
  jwtAuth(), // Use passport JWT auth middleware
  rbacMiddleware([Role.ADMIN]),
  validate(paginationSchema, 'query'),
  userController.getPaginatedUsers,
);

export default router;
