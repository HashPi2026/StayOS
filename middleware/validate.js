import { ValidationError } from '../utils/errors.js';
export function validate(validator) {
    return async (req, res, next) => {
        try {
            const errorOrErrors = await validator(req);
            if (errorOrErrors) {
                const errors = Array.isArray(errorOrErrors) ? errorOrErrors : [errorOrErrors];
                if (errors.length > 0) {
                    throw new ValidationError('Input validation failed', { issues: errors });
                }
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
}
