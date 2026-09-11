export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(entity, id) {
    super(
      id !== undefined ? `${entity} with identifier '${id}' was not found.` : `${entity} not found.`,
      404,
      'NOT_FOUND',
      { entity, id }
    );
  }
}

export class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class ConflictError extends AppError {
  constructor(message, details) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied.') {
    super(message, 403, 'FORBIDDEN');
  }
}
