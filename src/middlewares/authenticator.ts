import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { UnauthorizedError } from '../lib/CustomError';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
};
