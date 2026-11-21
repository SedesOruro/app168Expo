import type { Coordinates } from './EmergenciasService';

/**
 * Ubicacion con la API de geolocalizacion del navegador (equivalente a expo-location).
 * Exige HTTPS en produccion: en http:// el navegador la niega sin preguntar.
 *
 * Igual que en el APK se acepta una posicion de hasta un minuto de antiguedad,
 * que llega al instante, y solo si no la hay se pide una nueva de alta precision.
 */
export const getCurrentCoordinates = (): Promise<Coordinates> =>
  new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Este navegador no permite obtener la ubicacion.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (posicion) =>
        resolve({
          latitude: posicion.coords.latitude,
          longitude: posicion.coords.longitude,
          accuracy: posicion.coords.accuracy,
        }),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error('Debe permitir la ubicacion para enviar una emergencia.'));
          return;
        }
        reject(new Error('No se pudo obtener la ubicacion. Intente de nuevo.'));
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 20_000 },
    );
  });
