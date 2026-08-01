import { ApiError } from './apiError';
import { env } from '../config/env';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
};

export type HttpClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<T>;
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<T>;
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<T>;
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<T>;
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) => Promise<T>;
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), env.requestTimeoutMs);
  const signal = options.signal ?? controller.signal;
  const url = `${env.apiBaseUrl}${path}`;

  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal,
    });

    const text = await response.text();
    const payload = text.length > 0 ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new ApiError('Request failed', response.status, payload);
    }

    return payload as T;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const httpClient: HttpClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
