import type { AuthSession, User } from '../../domain/entities/User';

type UserDto = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type AuthSessionDto = {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
};

export const mapUser = (dto: UserDto): User => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  avatarUrl: dto.avatarUrl,
});

export const mapAuthSession = (dto: AuthSessionDto): AuthSession => ({
  user: mapUser(dto.user),
  accessToken: dto.accessToken,
  refreshToken: dto.refreshToken,
});
