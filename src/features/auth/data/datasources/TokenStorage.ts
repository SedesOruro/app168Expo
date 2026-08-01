import type { SecureStorage } from '../../../../shared/storage/secureStorage';

const ACCESS_TOKEN_KEY = 'access-token';
const REFRESH_TOKEN_KEY = 'refresh-token';

export class TokenStorage {
  constructor(private readonly storage: SecureStorage) {}

  getAccessToken(): Promise<string | null> {
    return this.storage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): Promise<string | null> {
    return this.storage.getItem(REFRESH_TOKEN_KEY);
  }

  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      this.storage.setItem(ACCESS_TOKEN_KEY, accessToken),
      this.storage.setItem(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  }

  async clear(): Promise<void> {
    await Promise.all([
      this.storage.removeItem(ACCESS_TOKEN_KEY),
      this.storage.removeItem(REFRESH_TOKEN_KEY),
    ]);
  }
}
