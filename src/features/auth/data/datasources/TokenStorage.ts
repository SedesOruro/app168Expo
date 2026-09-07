import type { User } from '../../domain/entities/User';
import type { SecureStorage } from '../../../../shared/storage/secureStorage';

const ACCESS_TOKEN_KEY = 'access-token';
const REFRESH_TOKEN_KEY = 'refresh-token';
const USER_KEY = 'session-user';

/**
 * Sesion local del dispositivo. Ademas de los tokens guarda el usuario, porque el
 * registro es de una sola vez por dispositivo: si al abrir la aplicacion no hay
 * conexion con la Central, hay que poder seguir usandola con el registro anterior
 * en vez de mandar a la persona de vuelta al formulario.
 */
export class TokenStorage {
  constructor(private readonly storage: SecureStorage) {}

  getAccessToken(): Promise<string | null> {
    return this.storage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): Promise<string | null> {
    return this.storage.getItem(REFRESH_TOKEN_KEY);
  }

  async getUser(): Promise<User | null> {
    const crudo = await this.storage.getItem(USER_KEY);
    if (!crudo) return null;
    try {
      return JSON.parse(crudo) as User;
    } catch {
      // Un usuario ilegible no debe impedir arrancar: se trata como ausente.
      return null;
    }
  }

  async saveUser(user: User): Promise<void> {
    await this.storage.setItem(USER_KEY, JSON.stringify(user));
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
      this.storage.removeItem(USER_KEY),
    ]);
  }
}
