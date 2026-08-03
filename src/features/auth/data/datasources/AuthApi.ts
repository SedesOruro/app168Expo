import { endpoints } from '../../../../shared/api/endpoints';
import type { HttpClient } from '../../../../shared/api/httpClient';
import type {
  LoginCredentials,
  RegisterPayload,
} from '../../domain/repositories/AuthRepository';
import type { AuthSessionDto } from '../mappers/userMapper';

export class AuthApi {
  constructor(private readonly client: HttpClient) {}

  async login(credentials: LoginCredentials): Promise<AuthSessionDto> {
    return this.client.post<AuthSessionDto>(endpoints.auth.login, credentials);
  }

  async register(payload: RegisterPayload): Promise<AuthSessionDto> {
    return this.client.post<AuthSessionDto>(endpoints.auth.register, payload);
  }

  async refreshToken(refreshToken: string): Promise<AuthSessionDto> {
    return this.client.post<AuthSessionDto>(endpoints.auth.refresh, {
      refreshToken,
    });
  }

  async logout(refreshToken?: string | null): Promise<void> {
    await this.client.post<void>(endpoints.auth.logout, { refreshToken });
  }

  async me(accessToken: string): Promise<AuthSessionDto['user']> {
    return this.client.get<AuthSessionDto['user']>(endpoints.auth.me, {
      token: accessToken,
    });
  }

}
