import type { AuthSession, User } from '../../domain/entities/User';
import type {
  AuthRepository,
  LoginCredentials,
  RegisterPayload,
} from '../../domain/repositories/AuthRepository';
import type { AuthApi } from '../datasources/AuthApi';
import { mapAuthSession } from '../mappers/userMapper';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly api: AuthApi) {}

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    return mapAuthSession(await this.api.login(credentials));
  }

  async register(payload: RegisterPayload): Promise<AuthSession> {
    return mapAuthSession(await this.api.register(payload));
  }

  async refreshToken(refreshToken: string): Promise<AuthSession> {
    return mapAuthSession(await this.api.refreshToken(refreshToken));
  }

  logout(refreshToken?: string | null): Promise<void> {
    return this.api.logout(refreshToken);
  }

  async me(accessToken: string): Promise<User> {
    const session = await this.api.refreshToken(accessToken);
    return mapAuthSession(session).user;
  }
}
