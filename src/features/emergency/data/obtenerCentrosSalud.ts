import { emergencyApi, type Coordinates, type HealthCenter } from './EmergencyApi';
import {
  guardarCache,
  hayCambios,
  leerCache,
  recalcularDistancias,
} from './cacheCentrosSalud';

export type ResultadoCentros = {
  centros: HealthCenter[];
  /** De donde salieron los datos que se estan mostrando. */
  origen: 'red' | 'cache';
  /** Cuando se guardo el cache. Solo cuando `origen` es 'cache'. */
  actualizadoEn?: string;
  /** Cierto cuando el backend traia un catalogo distinto al guardado. */
  huboCambios: boolean;
};

/**
 * Devuelve los centros de salud sin depender de que haya backend.
 *
 * Intenta la red primero: si responde, compara el catalogo con el que hay en el
 * telefono y solo reescribe el cache cuando algo cambio. Si no responde, sirve lo
 * guardado, recalculando las distancias desde la ubicacion actual.
 *
 * El mapa es informacion de emergencia: quedarse sin centros porque la Central no
 * responde es peor que mostrar un catalogo de hace unos dias.
 */
export const obtenerCentrosSalud = async (
  ubicacion: Coordinates | null,
): Promise<ResultadoCentros> => {
  try {
    const frescos = await emergencyApi.getHealthCenters(ubicacion);
    const guardado = await leerCache();
    const huboCambios = !guardado || hayCambios(guardado.centros, frescos);

    if (huboCambios) {
      await guardarCache(frescos);
    }

    return { centros: frescos, origen: 'red', huboCambios };
  } catch (error) {
    const guardado = await leerCache();

    // Sin red y sin cache no hay nada que ofrecer: que lo trate la pantalla.
    if (!guardado || guardado.centros.length === 0) throw error;

    return {
      centros: recalcularDistancias(guardado.centros, ubicacion),
      origen: 'cache',
      actualizadoEn: guardado.actualizadoEn,
      huboCambios: false,
    };
  }
};
