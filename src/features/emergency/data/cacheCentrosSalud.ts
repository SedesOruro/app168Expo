import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Coordinates, HealthCenter } from './EmergencyApi';

const CLAVE_CACHE = 'cache-centros-salud';

export type CacheCentros = {
  centros: HealthCenter[];
  /** ISO 8601 del momento en que se guardo. */
  actualizadoEn: string;
};

/**
 * Huella de los datos del centro, sin lo que depende de quien pregunta.
 *
 * `distanceKm` lo calcula el backend respecto a la ubicacion enviada en cada
 * peticion, asi que cambia al moverse aunque el catalogo sea identico. Incluirlo
 * haria que cada consulta pareciera un cambio y reescribiria el cache sin motivo.
 */
const huellaDe = (centros: HealthCenter[]): string =>
  centros
    .map(c =>
      [c.uuid, c.nombre, c.direccion ?? '', c.nivel ?? '', c.latitud ?? '', c.longitud ?? ''].join(
        '|',
      ),
    )
    .sort()
    .join('\n');

/** Cierto cuando el catalogo del backend difiere del guardado en el telefono. */
export const hayCambios = (
  guardados: HealthCenter[],
  frescos: HealthCenter[],
): boolean => huellaDe(guardados) !== huellaDe(frescos);

export const leerCache = async (): Promise<CacheCentros | null> => {
  try {
    const crudo = await AsyncStorage.getItem(CLAVE_CACHE);
    if (!crudo) return null;
    const guardado = JSON.parse(crudo) as CacheCentros;
    return Array.isArray(guardado.centros) ? guardado : null;
  } catch {
    // Un cache ilegible no debe romper el mapa: se trata como si no existiera.
    return null;
  }
};

export const guardarCache = async (centros: HealthCenter[]): Promise<void> => {
  const contenido: CacheCentros = {
    centros,
    actualizadoEn: new Date().toISOString(),
  };
  await AsyncStorage.setItem(CLAVE_CACHE, JSON.stringify(contenido)).catch(
    () => undefined,
  );
};

export const borrarCache = async (): Promise<void> => {
  await AsyncStorage.removeItem(CLAVE_CACHE).catch(() => undefined);
};

const RADIO_TIERRA_KM = 6371;
const aRadianes = (grados: number): number => (grados * Math.PI) / 180;

/** Distancia en kilometros entre dos puntos, formula del haversine. */
export const distanciaKm = (a: Coordinates, b: Coordinates): number => {
  const dLat = aRadianes(b.latitude - a.latitude);
  const dLon = aRadianes(b.longitude - a.longitude);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(a.latitude)) *
      Math.cos(aRadianes(b.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(s));
};

/**
 * Recalcula la distancia de cada centro desde la ubicacion actual y los ordena.
 *
 * Hace falta al servir desde el cache: la `distanceKm` guardada se calculo con la
 * ubicacion que habia cuando se descargo, y mostrarla sin recalcular daria
 * distancias equivocadas a quien se haya movido.
 */
export const recalcularDistancias = (
  centros: HealthCenter[],
  desde: Coordinates | null,
): HealthCenter[] => {
  if (!desde) return centros;

  return centros
    .map(centro => {
      // Ojo con Number(null), que da 0: sin este guardia un centro sin coordenadas
      // aterrizaba en el punto (0, 0), frente a Africa, con una distancia absurda.
      const crudoLat = centro.latitud;
      const crudoLon = centro.longitud;
      const faltaAlguna =
        crudoLat == null || crudoLon == null || crudoLat === '' || crudoLon === '';
      const lat = Number(crudoLat);
      const lon = Number(crudoLon);
      if (faltaAlguna || !Number.isFinite(lat) || !Number.isFinite(lon)) {
        return { ...centro, distanceKm: null };
      }
      return {
        ...centro,
        distanceKm: distanciaKm(desde, { latitude: lat, longitude: lon }),
      };
    })
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
};
