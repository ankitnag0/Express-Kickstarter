import { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { CustomError } from '../lib/CustomError';
import { handleMongooseError } from '../utils/mongoose-error-handler';

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // If it's a known CustomError, return the serialized response
  if (err instanceof CustomError) {
    return res.status(err.status).json(err.serialize());
  }

  // Handling Mongoose errors (or errors that have a "code" property)
  if (err instanceof mongoose.Error || 'code' in err) {
    const mongooseErrorResponse = handleMongooseError(err);
    return res.status(mongooseErrorResponse.status).json({
      success: false,
      status: mongooseErrorResponse.status,
      error: mongooseErrorResponse.error,
      message: mongooseErrorResponse.message,
      ...(mongooseErrorResponse.details && {
        details: mongooseErrorResponse.details,
      }),
    });
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
