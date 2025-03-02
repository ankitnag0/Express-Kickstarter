// src/modules/user/user.router.ts
import { jwtAuth } from '@config/passport'; // Import jwtAuth from passport config
import { googleAuth } from '@config/passport'; // Import googleAuth
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

// Google OAuth Routes (ADD THESE ROUTES)
router.get('/auth/google', googleAuth()); // Route to initiate Google OAuth flow

router.get(
  '/auth/google/callback', // Google OAuth callback route
  googleAuth(), // Use googleAuth middleware to handle callback
  userController.googleOAuthCallback, // Handler to process successful Google login
);

export default router;
