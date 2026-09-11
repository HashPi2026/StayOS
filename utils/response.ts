import { Response } from 'express';

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: any;
}

export interface ApiMetaPayload {
  timestamp: string;
  clientId?: string;
  count?: number;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  data: T | null;
  error: ApiErrorPayload | null;
  meta: ApiMetaPayload;
}

export function createMeta(clientId?: string, extra: Record<string, any> = {}): ApiMetaPayload {
  return {
    timestamp: new Date().toISOString(),
    ...(clientId ? { clientId } : {}),
    ...extra,
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: Record<string, any>
): Response {
  const clientId = (res.req as any)?.clientId;
  const payload: ApiResponse<T> = {
    data,
    error: null,
    meta: createMeta(clientId, {
      count: Array.isArray(data) ? data.length : undefined,
      ...meta,
    }),
  };
  return res.status(statusCode).json(payload);
}

export function sendCreated<T>(
  res: Response,
  data: T,
  meta?: Record<string, any>
): Response {
  return sendSuccess(res, data, 201, meta);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

export function sendError(
  res: Response,
  statusCode: number,
  errorCode: string,
  message: string,
  details?: any,
  meta?: Record<string, any>
): Response {
  const clientId = (res.req as any)?.clientId;
  const payload: ApiResponse<null> = {
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
