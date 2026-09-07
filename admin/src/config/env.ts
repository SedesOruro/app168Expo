/**
 * Direcciones que no pueden salir en una compilacion de produccion.
 *
 * El caso real: Vite carga `.env` en todos los modos, asi que un build de
 * produccion sin `.env.production` se lleva los valores de desarrollo y el panel
 * sale apuntando a localhost. La variable existe, solo que es la equivocada, asi
 * que comprobar que este definida no basta: hay que mirar a donde apunta.
 */
const ES_DIRECCION_LOCAL = /localhost|127\.0\.0\.1|0\.0\.0\.0|10\.0\.2\.2|192\.168\.|::1/;

/**
 * Direcciones del panel administrativo.
 *
 * En desarrollo se admite localhost. En una compilacion de produccion no: el panel
 * saldria apuntando a una direccion que nadie puede alcanzar desde internet y
 * fallaria en el servidor sin decir por que. Mejor que la compilacion se detenga.
 */
const exigirEnProduccion = (valor: string | undefined, nombre: string, porDefecto: string): string => {
  const elegido = valor || porDefecto;

  if (import.meta.env.PROD && ES_DIRECCION_LOCAL.test(elegido)) {
    throw new Error(
      `${nombre} apunta a ${elegido}, que solo sirve en desarrollo. ` +
        'Copia admin/.env.production.example como .env.production antes de compilar.',
    );
  }

  return elegido;
};

export const API_URL = exigirEnProduccion(
  import.meta.env.VITE_API_URL,
  'VITE_API_URL',
  'http://localhost:8080/api',
);

export const STORAGE_URL = exigirEnProduccion(
  import.meta.env.VITE_STORAGE_URL,
  'VITE_STORAGE_URL',
  `${API_URL}/storage/file`,
);

export const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'auth_token';
export const EDITOR_API_KEY = import.meta.env.VITE_EDITOR_API_KEY || '';
