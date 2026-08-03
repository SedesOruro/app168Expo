export const env = {
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api',
  socketUrl:
    process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://10.0.2.2:8080',
  mapStyleUrl:
    process.env.EXPO_PUBLIC_MAP_STYLE_URL ??
    'https://tiles.openfreemap.org/styles/liberty',
  enableSocket: false,
  requestTimeoutMs: 15000,
};

export type AppEnv = typeof env;
