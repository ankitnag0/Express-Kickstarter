import mongoose from 'mongoose';

// Define a union type for Mongoose errors
type MongooseErrorType =
  | mongoose.Error.ValidationError
  | mongoose.Error.CastError
  | mongoose.Error.DocumentNotFoundError
  | mongoose.Error.MongooseServerSelectionError
  | mongoose.Error.VersionError
  | { code: number; keyValue: Record<string, unknown>; message?: string } // For duplicate key errors
  | Error; // Fallback for unexpected errors

export const handleMongooseError = (err: MongooseErrorType) => {
  // Handle Mongoose Validation Errors
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
    return {
      statusCode: 400,
      error: 'ValidationError',
      message: 'Validation failed',
      details: errors,
    };
  }

  // Handle Mongoose Cast Errors
  if (err instanceof mongoose.Error.CastError) {
    return {
      statusCode: 400,
      error: 'CastError',
      message: `Invalid value for field: ${err.path}`,
    };
  }

  // Handle Duplicate Key Errors
  if ('code' in err && err.code === 11000) {
    return {
      statusCode: 409,
      error: 'DuplicateKeyError',
      message: 'Duplicate entry detected',
      details: (err as { code: number; keyValue: Record<string, unknown> })
        .keyValue,
    };
  }

  // Handle Document Not Found Errors
  if (err instanceof mongoose.Error.DocumentNotFoundError) {
    return {
      statusCode: 404,
      error: 'DocumentNotFoundError',
      message: 'The requested document was not found',
    };
  }

  // Handle Database Connection Errors
  if (err instanceof mongoose.Error.MongooseServerSelectionError) {
    return {
      statusCode: 500,
      error: 'DatabaseConnectionError',
      message: 'Failed to connect to the database',
    };
  }

  // Handle Version Errors
  if (err instanceof mongoose.Error.VersionError) {
    return {
      statusCode: 409,
      error: 'VersionError',
      message: 'Document version mismatch',
    };
  }

  // Fallback for unhandled Mongoose errors
  return {
    statusCode: 500,
    error: 'MongooseError',
    message: err.message || 'An unexpected Mongoose error occurred',
  };
};
