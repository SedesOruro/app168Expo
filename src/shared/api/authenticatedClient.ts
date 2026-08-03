import type { AuthSessionDto } from '../../features/auth/data/mappers/userMapper';
import { TokenStorage } from '../../features/auth/data/datasources/TokenStorage';
import { secureStorage } from '../storage/secureStorage';
import { ApiError } from './apiError';
import { endpoints } from './endpoints';
import { httpClient, type HttpClient } from './httpClient';

const tokenStorage = new TokenStorage(secureStorage);
let refreshRequest: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) throw new ApiError('La sesion ha expirado', 401);
      const session = await httpClient.post<AuthSessionDto>(endpoints.auth.refresh, {
        refreshToken,
      });
      await tokenStorage.saveTokens(session.accessToken, session.refreshToken);
      return session.accessToken;
    })().finally(() => {
      refreshRequest = null;
    });
  }
  return refreshRequest;
};

const execute = async <T>(
  call: (token: string) => Promise<T>,
): Promise<T> => {
  const token = await tokenStorage.getAccessToken();
  if (!token) throw new ApiError('Debe iniciar sesion', 401);
  try {
    return await call(token);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    return call(await refreshAccessToken());
  }
};

export const authenticatedClient: HttpClient = {
  get: (path, options) =>
    execute(token => httpClient.get(path, { ...options, token })),
  post: (path, body, options) =>
    execute(token => httpClient.post(path, body, { ...options, token })),
  put: (path, body, options) =>
    execute(token => httpClient.put(path, body, { ...options, token })),
  patch: (path, body, options) =>
    execute(token => httpClient.patch(path, body, { ...options, token })),
  delete: (path, options) =>
    execute(token => httpClient.delete(path, { ...options, token })),
};

export const getValidAccessToken = async (forceRefresh = false): Promise<string> => {
  if (forceRefresh) return refreshAccessToken();
  const token = await tokenStorage.getAccessToken();
  if (token) return token;
  return refreshAccessToken();
};
