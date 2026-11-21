import { useEffect, useState } from 'react';
import type { EstadoRed } from '../services/emergencias/decidirCanalDeEmergencia';

/** Estado de la red segun el navegador (equivalente a expo-network). */
export const leerEstadoRed = (): EstadoRed => ({
  isConnected: typeof navigator === 'undefined' ? null : navigator.onLine,
  // El navegador no distingue "conectado" de "con internet": se deja en null,
  // que decidirCanalDeEmergencia trata como "aun no se sabe".
  isInternetReachable: null,
});

/** Se actualiza solo con los eventos `online`/`offline` del navegador. */
export const useEstadoRed = (): EstadoRed => {
  const [estado, setEstado] = useState<EstadoRed>(leerEstadoRed);

  useEffect(() => {
    const actualizar = (): void => setEstado(leerEstadoRed());
    window.addEventListener('online', actualizar);
    window.addEventListener('offline', actualizar);
    return () => {
      window.removeEventListener('online', actualizar);
      window.removeEventListener('offline', actualizar);
    };
  }, []);

  return estado;
};
