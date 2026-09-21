import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

// Extend Express Request interface to include clientId
declare global {
  namespace Express {
    interface Request {
      clientId?: string;
    }
  }
}

export function tenantMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Read tenant key from header (primary) or query (optional fallback for local dev)
  const headerClientId = req.header('x-client-id') || req.header('X-Client-Id');
  const queryClientId = req.query.clientId as string | undefined;

  let clientId = (headerClientId || queryClientId)?.trim();

  if (!clientId) {
    sendError(
      res,
      401,
      'UNAUTHORIZED_TENANT',
      'Tenant identifier is missing. Provide the tenant client_id in the `x-client-id` header.',
      { header: 'x-client-id' }
    );
    return;
  }

  // Gracefully map legacy string identifiers if present
  if (clientId === 'DIS_001') clientId = '10001';
  if (clientId === 'STVMC_SURAT') clientId = '10002';

  const numericId = parseInt(clientId, 10);
  if (isNaN(numericId) || numericId < 10000 || numericId > 99999 || String(numericId) !== clientId) {
    sendError(
      res,
      400,
      'INVALID_TENANT_ID',
      'Property ID (Client_ID) must be a unique 5-digit number (10000-99999).',
      { clientId }
    );
    return;
  }

  // Bind tenant identifier strictly to the request context
  req.clientId = clientId;
  next();
}
