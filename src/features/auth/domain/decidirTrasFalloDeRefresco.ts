import { ApiError } from '../../../shared/api/apiError';

/**
 * Que hacer cuando falla el refresco de la sesion al arrancar.
 *
 * - `cerrar_sesion`: el backend contesto que la sesion ya no vale. Es el unico caso
 *   en el que se borran los tokens del dispositivo.
 * - `mantener_local`: no hubo respuesta del backend (sin conexion, servicio caido,
 *   tiempo agotado). El registro del dispositivo se conserva y la aplicacion sigue
 *   funcionando con la sesion anterior.
 *
 * La distincion importa: borrar los tokens ante cualquier fallo dejaba fuera a
 * quien abriera la aplicacion sin cobertura, y como el registro es de una sola vez
 * por dispositivo, esa persona se quedaba sin forma de volver a entrar.
 */
export type DecisionSesion = 'cerrar_sesion' | 'mantener_local';

export const decidirTrasFalloDeRefresco = (error: unknown): DecisionSesion => {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return 'cerrar_sesion';
  }

  return 'mantener_local';
};
