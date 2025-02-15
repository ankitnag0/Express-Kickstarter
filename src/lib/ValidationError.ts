import { ZodError } from 'zod';
import { CustomError } from './CustomError';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class ValidationError extends CustomError {
  public errors: ValidationErrorDetail[];

  constructor(errors: ValidationErrorDetail[], message = 'Validation Error') {
    super(message, 422);
    this.errors = errors;
  }

  serialize() {
    return {
      success: false,
      status: this.status,
      error: this.name,
      message: this.message,
      details: this.errors,
    };
  }
}

export class ZodValidationError extends ValidationError {
  constructor(error: ZodError) {
    const errors = error.errors.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    super(errors, 'Zod Validation Error');
  }
}
