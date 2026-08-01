export const env = {
  apiBaseUrl: 'https://api.example.com/v1',
  socketUrl: 'https://api.example.com',
  enableMockAuth: true,
  enableSocket: false,
  requestTimeoutMs: 15000,
};

export type AppEnv = typeof env;
