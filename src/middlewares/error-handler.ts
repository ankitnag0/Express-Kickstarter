import { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { CustomError } from '../lib/CustomError';
import { handleMongooseError } from '../utils/mongoose-error-handler';

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // Log the error using the logger

  // Handle Custom API Errors
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.name,
      message: err.message,
    });
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'ZodValidationError',
      message: 'Invalid request data',
      details: err.format(),
    });
  }

  // Handle Mongoose Errors
  if (err instanceof mongoose.Error || 'code' in err) {
    const mongooseErrorResponse = handleMongooseError(err);
    return res.status(mongooseErrorResponse.statusCode).json({
      success: false,
      error: mongooseErrorResponse.error,
      message: mongooseErrorResponse.message,
      ...(mongooseErrorResponse.details && {
        details: mongooseErrorResponse.details,
      }),
    });
  }

  // Fallback for unhandled errors
  return res.status(500).json({
    success: false,
    error: 'InternalServerError',
    message: 'Something went wrong',
  });
};

export default errorHandler;
