import { sendError } from '../utils/response.js';
export function tenantMiddleware(req, res, next) {
    // Read tenant key from header (primary) or query (optional fallback for local dev)
    const headerClientId = req.header('x-client-id') || req.header('X-Client-Id');
    const queryClientId = req.query.clientId;
    const clientId = (headerClientId || queryClientId)?.trim();
    if (!clientId) {
        sendError(res, 401, 'UNAUTHORIZED_TENANT', 'Tenant identifier is missing. Provide the tenant client_id in the `x-client-id` header.', { header: 'x-client-id' });
        return;
    }
    if (clientId.length > 50) {
        sendError(res, 400, 'INVALID_TENANT_ID', 'Tenant identifier exceeds the maximum allowed length of 50 characters.', { clientId });
        return;
    }
    // Bind tenant identifier strictly to the request context
    req.clientId = clientId;
    next();
}
