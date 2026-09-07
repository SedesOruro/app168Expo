import { ApiError } from '../../../../shared/api/apiError';

export type DiagnosticoFallo = {
  titulo: string;
  detalle: string;
};

/**
 * Traduce el fallo al cargar los centros de salud en un mensaje concreto.
 *
 * Un fallo de red o de sesion no es lo mismo que no haber centros cerca. Decirle a
 * alguien que puede estar en una emergencia que "no hay centros de salud" cuando lo
 * que fallo fue la peticion es un error grave, asi que cada caso lleva su mensaje.
 *
 * Ojo: `authenticatedClient` lanza un ApiError 401 sin llegar a la red cuando no hay
 * token, asi que ese caso tapa a los demas mientras no haya sesion iniciada.
 */
export const diagnosticarFalloCentros = (
  error: unknown,
): DiagnosticoFallo => {
  const estado = error instanceof ApiError ? error.status : undefined;

  if (estado === 401 || estado === 403) {
    return {
      titulo: 'Sesion caducada',
      detalle: 'Vuelve a iniciar sesion para ver los centros de salud cercanos.',
    };
  }

  if (estado != null && estado >= 500) {
    return {
      titulo: 'El servicio no responde',
      detalle: 'La Central 168 no esta disponible en este momento. Intenta de nuevo.',
    };
  }

  return {
    titulo: 'Sin conexion',
    detalle:
      'No se pudo contactar con la Central 168. Revisa tu conexion e intenta de nuevo.',
  };
};
