import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

export type ValidatorFn = (req: Request) => string | string[] | null | Promise<string | string[] | null>;

export function validate(validator: ValidatorFn) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errorOrErrors = await validator(req);
      if (errorOrErrors) {
        const errors = Array.isArray(errorOrErrors) ? errorOrErrors : [errorOrErrors];
        if (errors.length > 0) {
          throw new ValidationError('Input validation failed', { issues: errors });
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
