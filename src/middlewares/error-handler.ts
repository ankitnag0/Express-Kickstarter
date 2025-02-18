import { ErrorRequestHandler } from 'express';

import { logger } from '../config/logger';
import { CustomError } from '../lib/CustomError';

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
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

  // If it's a known CustomError, return the serialized response
  if (err instanceof CustomError) {
    return res.status(err.status).json(err.serialize());
  }

  // Fallback for unknown errors
  return res.status(500).json({
    success: false,
    status: 500,
    error: 'InternalServerError',
    message: 'Something went wrong',
  });
};

export default errorHandler;
