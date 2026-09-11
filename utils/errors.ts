export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, errorCode: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id?: string | number) {
    super(
      id !== undefined ? `${entity} with identifier '${id}' was not found.` : `${entity} not found.`,
      404,
      'NOT_FOUND',
      { entity, id }
    );
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied.') {
    super(message, 403, 'FORBIDDEN');
  }
}
