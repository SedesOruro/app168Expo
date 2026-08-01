import { endpoints } from '../../../../shared/api/endpoints';
import type { HttpClient } from '../../../../shared/api/httpClient';
import { env } from '../../../../shared/config/env';
import type {
  LoginCredentials,
  RegisterPayload,
} from '../../domain/repositories/AuthRepository';
import type { AuthSessionDto } from '../mappers/userMapper';

export class AuthApi {
  constructor(private readonly client: HttpClient) {}

  async login(credentials: LoginCredentials): Promise<AuthSessionDto> {
    if (env.enableMockAuth) {
      return this.mockSession(credentials.email);
    }

    return this.client.post<AuthSessionDto>(endpoints.auth.login, credentials);
  }

  async register(payload: RegisterPayload): Promise<AuthSessionDto> {
    if (env.enableMockAuth) {
      return this.mockSession(payload.email, payload.name);
    }

    return this.client.post<AuthSessionDto>(endpoints.auth.register, payload);
  }

  async refreshToken(refreshToken: string): Promise<AuthSessionDto> {
    if (env.enableMockAuth) {
      return this.mockSession('product@desarrollo.dev', 'Product Builder');
    }

    return this.client.post<AuthSessionDto>(endpoints.auth.refresh, {
      refreshToken,
    });
  }

  async logout(refreshToken?: string | null): Promise<void> {
    if (env.enableMockAuth) {
      return;
    }

    await this.client.post<void>(endpoints.auth.logout, { refreshToken });
  }

  private mockSession(email: string, name: string = 'Product Builder'): AuthSessionDto {
    return {
      user: {
        id: 'usr_demo',
        name,
        email,
      },
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
    };
  }
}
