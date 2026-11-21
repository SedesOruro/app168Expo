/**
 * Direcciones que no pueden salir en una compilacion de produccion.
 *
 * Vite carga `.env` en todos los modos, asi que un build de produccion sin
 * `.env.production` se lleva los valores de desarrollo y la PWA sale apuntando a
 * localhost. Comprobar que la variable exista no basta: hay que mirar a donde apunta.
 */
const ES_DIRECCION_LOCAL = /localhost|127\.0\.0\.1|0\.0\.0\.0|10\.0\.2\.2|192\.168\.|::1/;

/**
 * En desarrollo se admite localhost. En produccion no: la PWA saldria apuntando a
 * una direccion que nadie alcanza desde un telefono real. Mejor que falle al
 * arrancar y se vea, a que falle en manos de alguien que necesita una ambulancia.
 */
const exigirEnProduccion = (valor: string | undefined, nombre: string, porDefecto: string): string => {
  const elegido = valor || porDefecto;

  if (import.meta.env.MODE === 'production' && ES_DIRECCION_LOCAL.test(elegido)) {
    throw new Error(
      `${nombre} apunta a ${elegido}, que solo sirve en desarrollo. ` +
        'Copia frontend/.env.production.example como .env.production antes de compilar.',
    );
  }

  return elegido;
};

export const env = {
  apiBaseUrl: exigirEnProduccion(import.meta.env.VITE_API_URL, 'VITE_API_URL', 'http://localhost:8080/api'),
  socketUrl: exigirEnProduccion(import.meta.env.VITE_SOCKET_URL, 'VITE_SOCKET_URL', 'http://localhost:8080'),
  // El estilo del mapa es un servicio publico: su valor por defecto vale tambien en produccion.
  mapStyleUrl: import.meta.env.VITE_MAP_STYLE_URL ?? 'https://tiles.openfreemap.org/styles/liberty',
  enableSocket: false,
  requestTimeoutMs: 15000,
};

export type AppEnv = typeof env;
