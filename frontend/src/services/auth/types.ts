export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type AuthSession = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type AuthSessionDto = AuthSession;

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
