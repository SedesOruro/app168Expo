/**
 * Direcciones que no pueden salir en un APK de produccion. `10.0.2.2` es el alias
 * que solo entiende el emulador, y una IP privada solo funciona dentro de una red
 * concreta: ninguna de las dos sirve en el telefono de un ciudadano.
 */
const ES_DIRECCION_LOCAL = /localhost|127\.0\.0\.1|0\.0\.0\.0|10\.0\.2\.2|192\.168\.|::1/;

/**
 * Direcciones de la aplicacion movil.
 *
 * En desarrollo se admite el valor por defecto del emulador. En una compilacion de
 * produccion no: `10.0.2.2` es el alias que solo entiende el emulador de Android, y
 * un APK que saliera con esa direccion no podria hablar con la Central desde
 * ningun telefono real. Mejor que falle al arrancar y se vea, a que falle en manos
 * de alguien que necesita una ambulancia.
 */
const exigirEnProduccion = (
  valor: string | undefined,
  nombre: string,
  porDefecto: string,
): string => {
  const elegido = valor || porDefecto;

  if (!__DEV__ && ES_DIRECCION_LOCAL.test(elegido)) {
    throw new Error(
      `${nombre} apunta a ${elegido}, que solo sirve en desarrollo. ` +
        'Copia .env.production.example como .env antes de compilar el APK.',
    );
  }

  return elegido;
};

export const env = {
  apiBaseUrl: exigirEnProduccion(
    process.env.EXPO_PUBLIC_API_URL,
    'EXPO_PUBLIC_API_URL',
    'http://10.0.2.2:8080/api',
  ),
  socketUrl: exigirEnProduccion(
    process.env.EXPO_PUBLIC_SOCKET_URL,
    'EXPO_PUBLIC_SOCKET_URL',
    'http://10.0.2.2:8080',
  ),
  // El estilo del mapa es un servicio publico y su valor por defecto es correcto
  // tambien en produccion, asi que aqui no se exige nada.
  mapStyleUrl:
    process.env.EXPO_PUBLIC_MAP_STYLE_URL ??
    'https://tiles.openfreemap.org/styles/liberty',
  enableSocket: false,
  requestTimeoutMs: 15000,
};

export type AppEnv = typeof env;
