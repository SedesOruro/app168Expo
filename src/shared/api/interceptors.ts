import type { HttpClient } from './httpClient';

export type TokenResolver = () => Promise<string | null>;

export const withAuthToken = (
  client: HttpClient,
  resolveToken: TokenResolver,
): HttpClient => ({
  get: async (path, options) =>
    client.get(path, { ...options, token: await resolveToken() }),
  post: async (path, body, options) =>
    client.post(path, body, { ...options, token: await resolveToken() }),
  put: async (path, body, options) =>
    client.put(path, body, { ...options, token: await resolveToken() }),
  patch: async (path, body, options) =>
    client.patch(path, body, { ...options, token: await resolveToken() }),
  delete: async (path, options) =>
    client.delete(path, { ...options, token: await resolveToken() }),
});
