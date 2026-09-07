import type { HealthCenter } from '../features/emergency/data/EmergencyApi';
import {
  distanciaKm,
  hayCambios,
  recalcularDistancias,
} from '../features/emergency/data/cacheCentrosSalud';

const centro = (parcial: Partial<HealthCenter>): HealthCenter => ({
  id: 1,
  uuid: 'u-1',
  codigo_rues: '400009',
  nombre: 'HOSP. WALTER KHON',
  municipio: 'ORURO',
  latitud: -17.9868,
  longitud: -67.1131,
  ...parcial,
});

describe('hayCambios', () => {
  it('no ve cambios cuando el catalogo es el mismo', () => {
    expect(hayCambios([centro({})], [centro({})])).toBe(false);
  });

  it('ignora distanceKm, que depende de donde este la persona', () => {
    // El backend la recalcula en cada peticion; si contara, cualquier paso que
    // diera el usuario reescribiria el cache sin que el catalogo cambiara.
    expect(
      hayCambios([centro({ distanceKm: 0.2 })], [centro({ distanceKm: 8.7 })]),
    ).toBe(false);
  });

  it('detecta un centro con datos distintos', () => {
    expect(
      hayCambios([centro({})], [centro({ direccion: 'Calle nueva 123' })]),
    ).toBe(true);
  });

  it('detecta altas y bajas del catalogo', () => {
    expect(hayCambios([centro({})], [centro({}), centro({ uuid: 'u-2' })])).toBe(true);
    expect(hayCambios([centro({}), centro({ uuid: 'u-2' })], [centro({})])).toBe(true);
  });

  it('no depende del orden en que lleguen', () => {
    const a = [centro({ uuid: 'u-1' }), centro({ uuid: 'u-2' })];
    const b = [centro({ uuid: 'u-2' }), centro({ uuid: 'u-1' })];
    expect(hayCambios(a, b)).toBe(false);
  });
});

describe('distanciaKm', () => {
  it('mide una distancia conocida de Oruro', () => {
    // Km cero de Oruro al Hospital Walter Khon: algo menos de 2 km.
    const km = distanciaKm(
      { latitude: -17.9695681, longitude: -67.1147287 },
      { latitude: -17.986850938747356, longitude: -67.113170158668 },
    );
    expect(km).toBeGreaterThan(1.7);
    expect(km).toBeLessThan(2.1);
  });
});

describe('recalcularDistancias', () => {
  it('ordena por cercania a la ubicacion actual', () => {
    const lejos = centro({ uuid: 'lejos', latitud: -17.8, longitud: -67.0 });
    const cerca = centro({ uuid: 'cerca', latitud: -17.9696, longitud: -67.1147 });
    const orden = recalcularDistancias(
      [lejos, cerca],
      { latitude: -17.9695681, longitude: -67.1147287 },
    );
    expect(orden.map(c => c.uuid)).toEqual(['cerca', 'lejos']);
  });

  it('anula la distancia de un centro sin coordenadas', () => {
    const sinCoords = centro({ uuid: 'sin', latitud: null, longitud: null });
    const resultado = recalcularDistancias([sinCoords], {
      latitude: -17.96,
      longitude: -67.11,
    });
    expect(resultado[0]?.distanceKm).toBeNull();
  });

  it('devuelve los centros intactos si no hay ubicacion', () => {
    const entrada = [centro({ distanceKm: 5 })];
    expect(recalcularDistancias(entrada, null)).toBe(entrada);
  });
});
