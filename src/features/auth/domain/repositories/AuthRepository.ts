import type { AuthSession, User } from '../entities/User';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  names: string;
  surnames: string;
  document: string;
  complement?: string;
  birthDate: string;
  phone: string;
  address: string;
  contactName: string;
  contactPhone: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
};

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  register(payload: RegisterPayload): Promise<AuthSession>;
  refreshToken(refreshToken: string): Promise<AuthSession>;
  logout(refreshToken?: string | null): Promise<void>;
  me(accessToken: string): Promise<User>;
}
