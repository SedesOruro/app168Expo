import { LogManager } from '@maplibre/maplibre-react-native';

import { logger } from '../../shared/utils/logger';

export const initApp = async (): Promise<void> => {
  /*
   * MapLibre avisa "Invalid geometry in line layer" al parsear las teselas de
   * tiles.openfreemap.org. Es un defecto de datos del proveedor, no de esta
   * aplicacion, y no hay nada que corregir aqui; el aviso solo ensucia la consola
   * y levanta el banner de LogBox en desarrollo.
   *
   * Subir el minimo a "error" lo silencia. Contrapartida asumida: tambien deja de
   * verse cualquier otra advertencia de MapLibre. Para recuperarlas, volver a
   * "warn", que es el valor por defecto de la libreria.
   */
  LogManager.setLogLevel('error');

  logger.info('Emergencias 168 initialized');
};
