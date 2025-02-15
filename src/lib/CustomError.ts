export class CustomError extends Error {
  public statusCode: number;
  constructor(name: string, statusCode: number, message: string) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Standard API Errors
export class BadRequestError extends CustomError {
  constructor(message = 'Bad Request') {
    super('BadRequestError', 400, message);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = 'Unauthorized') {
    super('UnauthorizedError', 401, message);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message = 'Forbidden') {
    super('ForbiddenError', 403, message);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = 'Not Found') {
    super('NotFoundError', 404, message);
  }
}

export class ConflictError extends CustomError {
  constructor(message = 'Conflict') {
    super('ConflictError', 409, message);
  }
}

export class InternalServerError extends CustomError {
  constructor(message = 'Internal Server Error') {
    super('InternalServerError', 500, message);
  }
}
