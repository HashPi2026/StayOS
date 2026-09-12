import { pool } from '../db/pool.js';
import { sendError } from '../utils/response.js';

/**
 * Middleware that validates if the requesting role has access to a specific PMS module.
 * If x-role-id header is provided, it checks the role_module_access table in Postgres.
 * If no role header is provided, defaults to permitting access (or admin).
 */
export function requireModuleAccess(moduleKey) {
  return async (req, res, next) => {
    const roleId = req.header('x-role-id') || req.query.role_id;
    if (!roleId) {
      // Dev/default fallback
      return next();
    }

    try {
      const checkQuery = `
        SELECT 1 
        FROM role_module_access 
        WHERE role_id = $1 AND module_key = $2
        LIMIT 1;
      `;
      const { rows } = await pool.query(checkQuery, [Number(roleId), moduleKey]);
      if (rows.length === 0) {
        return sendError(
          res,
          403,
          'MODULE_ACCESS_DENIED',
          `Your role does not have permission to access the '${moduleKey}' module.`,
          { moduleKey, roleId: Number(roleId) }
        );
      }
      next();
    } catch (err) {
      console.error('[RoleAccess Middleware Error]:', err);
      // Fail closed or log
      next(err);
    }
  };
}
