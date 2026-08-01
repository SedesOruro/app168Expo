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
