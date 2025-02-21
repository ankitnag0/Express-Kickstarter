import { ZodValidationError } from '@lib/ValidationError';
import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema, property: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      return next(new ZodValidationError(result.error));
    }

    Object.defineProperty(req, property, {
      value: result.data,
      writable: false,
      configurable: false,
    });

    next();
  };
