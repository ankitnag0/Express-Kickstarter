import { ForbiddenError } from '@lib/CustomError';
import { Role } from '@modules/user/types/';
import { NextFunction, Request, Response } from 'express';

export const rbacMiddleware =
  (allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role as Role)) {
      throw new ForbiddenError('Access denied');
    }
    next();
  };
