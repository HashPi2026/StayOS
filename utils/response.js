export function createMeta(clientId, extra = {}) {
  return {
    timestamp: new Date().toISOString(),
    ...(clientId ? { clientId } : {}),
    ...extra,
  };
}

export function sendSuccess(res, data, statusCode = 200, meta) {
  const clientId = res.req?.clientId;
  const payload = {
    data,
    error: null,
    meta: createMeta(clientId, {
      count: Array.isArray(data) ? data.length : undefined,
      ...meta,
    }),
  };
  return res.status(statusCode).json(payload);
}

export function sendCreated(res, data, meta) {
  return sendSuccess(res, data, 201, meta);
}

export function sendNoContent(res) {
  return res.status(204).send();
}

export function sendError(res, statusCode, errorCode, message, details, meta) {
  const clientId = res.req?.clientId;
  const payload = {
    data: null,
    error: {
      code: errorCode,
      message,
      ...(details ? { details } : {}),
    },
    meta: createMeta(clientId, meta),
  };
  return res.status(statusCode).json(payload);
}
