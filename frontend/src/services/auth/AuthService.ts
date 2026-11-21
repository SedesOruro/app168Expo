import { endpoints } from '../base/endpoints';
import { httpClient } from '../base/httpClient';
import type { AuthSession, AuthSessionDto, LoginCredentials, RegisterPayload, User } from './types';

const mapUser = (dto: User): User => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  avatarUrl: dto.avatarUrl,
});

const mapAuthSession = (dto: AuthSessionDto): AuthSession => ({
  user: mapUser(dto.user),
  accessToken: dto.accessToken,
  refreshToken: dto.refreshToken,
});

/** Mismas llamadas que AuthApi + AuthRepositoryImpl de la app movil. */
export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthSession> =>
    mapAuthSession(await httpClient.post<AuthSessionDto>(endpoints.auth.login, credentials)),

  register: async (payload: RegisterPayload): Promise<AuthSession> =>
    mapAuthSession(await httpClient.post<AuthSessionDto>(endpoints.auth.register, payload)),

  refreshToken: async (refreshToken: string): Promise<AuthSession> =>
    mapAuthSession(await httpClient.post<AuthSessionDto>(endpoints.auth.refresh, { refreshToken })),

  logout: async (refreshToken?: string | null): Promise<void> => {
    await httpClient.post<void>(endpoints.auth.logout, { refreshToken });
  },

  me: async (accessToken: string): Promise<User> =>
    mapUser(await httpClient.get<User>(endpoints.auth.me, { token: accessToken })),
};
