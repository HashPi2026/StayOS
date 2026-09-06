import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
export function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) {
    // If response has already started sending headers, delegate to default Express handler
    if (res.headersSent) {
        return next(err);
    }
    // 1. Known Application Errors (ValidationError, NotFoundError, ConflictError, etc.)
    if (err instanceof AppError) {
        sendError(res, err.statusCode, err.errorCode, err.message, err.details);
        return;
    }
    // 2. PostgreSQL Specific Error Mapping
    if (err && typeof err.code === 'string') {
        switch (err.code) {
            // 23503: foreign_key_violation (MANDATORY REQUIREMENT: Map to HTTP 409 Conflict)
            case '23503': {
                const isDeleteOrUpdate = req.method === 'DELETE' || req.method === 'PUT';
                const message = isDeleteOrUpdate
                    ? `Cannot delete or update record because it is referenced by active dependent records (foreign key constraint '${err.constraint || 'fk'}').`
                    : `Referenced entity does not exist (foreign key constraint '${err.constraint || 'fk'}').`;
                sendError(res, 409, 'FOREIGN_KEY_CONFLICT', message, {
                    postgresCode: '23503',
                    table: err.table,
                    constraint: err.constraint,
                    detail: err.detail,
                });
                return;
            }
            // 23505: unique_violation
            case '23505': {
                sendError(res, 409, 'UNIQUE_CONSTRAINT_CONFLICT', `A record with this identifier or unique attribute already exists for this property.`, {
                    postgresCode: '23505',
                    table: err.table,
                    constraint: err.constraint,
                    detail: err.detail,
                });
                return;
            }
            // 23514: check_violation
            case '23514': {
                sendError(res, 400, 'CHECK_CONSTRAINT_VIOLATION', `The submitted data violates database constraint rules.`, {
                    postgresCode: '23514',
                    table: err.table,
                    constraint: err.constraint,
                    detail: err.detail,
                });
                return;
            }
            // 22P02: invalid_text_representation (e.g. invalid integer ID in URL path)
            case '22P02': {
                sendError(res, 400, 'INVALID_INPUT_SYNTAX', 'Invalid data type provided in query or path parameter (e.g., expected integer).', {
                    postgresCode: '22P02',
                    detail: err.message,
                });
                return;
            }
        }
    }
    // 3. Fallback Unhandled 500
    console.error('[Unhandled Internal Error]:', err);
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred on the server.'
        : err.message || 'Internal server error', process.env.NODE_ENV === 'production' ? undefined : { stack: err.stack });
}
