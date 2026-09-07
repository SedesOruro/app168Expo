import { ApiError } from '../shared/api/apiError';
import { diagnosticarFalloCentros } from '../features/emergency/presentation/utils/diagnosticarFalloCentros';

describe('diagnosticarFalloCentros', () => {
  it('distingue la sesion caducada', () => {
    expect(diagnosticarFalloCentros(new ApiError('no autorizado', 401)).titulo).toBe(
      'Sesion caducada',
    );
    expect(diagnosticarFalloCentros(new ApiError('prohibido', 403)).titulo).toBe(
      'Sesion caducada',
    );
  });

  it('distingue el fallo del servidor', () => {
    expect(diagnosticarFalloCentros(new ApiError('boom', 500)).titulo).toBe(
      'El servicio no responde',
    );
    expect(diagnosticarFalloCentros(new ApiError('gateway', 503)).titulo).toBe(
      'El servicio no responde',
    );
  });

  it('trata un fallo de red como falta de conexion', () => {
    // fetch rechaza con TypeError, no con ApiError, cuando no hay red.
    expect(
      diagnosticarFalloCentros(new TypeError('Network request failed')).titulo,
    ).toBe('Sin conexion');
  });

  it('nunca dice que no hay centros cuando lo que fallo fue la peticion', () => {
    const fallos = [
      new ApiError('no autorizado', 401),
      new ApiError('boom', 500),
      new TypeError('Network request failed'),
      new Error('desconocido'),
    ];

    for (const fallo of fallos) {
      expect(diagnosticarFalloCentros(fallo).detalle).not.toMatch(/no se encontraron/i);
    }
  });
});
