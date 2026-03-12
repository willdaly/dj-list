import { ZodError, type ZodSchema } from 'zod';
import { reportError } from '../lib/telemetry';

export class ApiClientError extends Error {
  status: number;
  userMessage: string;
  details?: string;

  constructor(message: string, status: number, userMessage: string, details?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.userMessage = userMessage;
    this.details = details;
  }
}

function toUserMessage(status: number): string {
  if (status === 401 || status === 403) {
    return 'Your session expired. Please sign in again.';
  }
  if (status >= 500) {
    return 'Server error. Please try again.';
  }
  return 'Request failed. Please try again.';
}

function encodeFormValue(value: string | number | boolean): string {
  return String(value);
}

export function toFormBody(data: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined) {
          params.append(`${key}[]`, encodeFormValue(item as string | number | boolean));
        }
      });
      return;
    }

    params.append(key, encodeFormValue(value as string | number | boolean));
  });
  return params;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export async function request<T>(options: {
  method: HttpMethod;
  path: string;
  data?: Record<string, unknown>;
  schema?: ZodSchema<T>;
}): Promise<T> {
  const schema = options.schema;
  const response = await fetch(options.path, {
    method: options.method,
    credentials: 'include',
    headers: options.data ? { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } : undefined,
    body: options.data ? toFormBody(options.data).toString() : undefined
  });

  const contentType = response.headers.get('content-type') || '';
  const expectsJson = schema !== undefined;

  if (!response.ok) {
    const text = await response.text();
    const err = new ApiClientError(
      `HTTP ${response.status} ${options.method} ${options.path}`,
      response.status,
      toUserMessage(response.status),
      text
    );
    reportError(err, `HTTP ${options.method} ${options.path}`);
    throw err;
  }

  if (expectsJson && !contentType.includes('application/json')) {
    // Legacy auth bounce renders HTML with 200; treat as auth/session issue.
    throw new ApiClientError(
      `Expected JSON but received ${contentType || 'unknown content type'}`,
      401,
      toUserMessage(401)
    );
  }

  if (!expectsJson) {
    return undefined as T;
  }

  const payload: unknown = await response.json();

  try {
    return schema.parse(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiClientError(
        `Invalid response shape for ${options.method} ${options.path}`,
        500,
        'Unexpected server response format.',
        error.message
      );
    }
    throw error;
  }
}
