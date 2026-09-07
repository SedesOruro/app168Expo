/**
 * Por donde sale la alerta cuando se pulsa el boton 168.
 *
 * - `app`: hay internet, se envia por la aplicacion con ubicacion, perfil y triaje.
 * - `llamada`: no hay datos. Se ofrece marcar el 168 por voz, que suele seguir
 *   disponible cuando los datos ya no lo estan: la red de voz aguanta con menos
 *   señal y se cae mas tarde en cortes y saturaciones.
 *
 * Ante la duda se elige `app`: si la deteccion falla pero si hay datos, el envio
 * normal funciona igual, mientras que mandar a llamar a quien podia enviar la
 * alerta completa le haria perder la ubicacion y el perfil medico.
 */
export type CanalEmergencia = 'app' | 'llamada';

export type EstadoRed = {
  isConnected?: boolean | null;
  isInternetReachable?: boolean | null;
};

export const decidirCanalDeEmergencia = (estado: EstadoRed | null): CanalEmergencia => {
  if (!estado) return 'app';

  // isInternetReachable puede venir null mientras el sistema aun lo comprueba;
  // solo un false explicito cuenta como "no hay internet".
  if (estado.isConnected === false) return 'llamada';
  if (estado.isInternetReachable === false) return 'llamada';

  return 'app';
};
