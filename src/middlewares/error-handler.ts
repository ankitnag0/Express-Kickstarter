import { logger } from '@config/logger';
import { CustomError } from '@lib/CustomError';
import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  logger.error(
    {
      err,
      url: req.originalUrl,
      method: req.method,
      reqBody: req.body,
      reqHeaders: req.headers,
    },
    'Error encountered',
  );

  if (err instanceof CustomError) {
    return res.status(err.status).json(err.serialize());
  }

  return res.status(500).json({
    success: false,
    status: 500,
    error: 'InternalServerError',
    message: 'Something went wrong',
  });
};
