import { ApiError } from '../shared/api/apiError';
import { decidirTrasFalloDeRefresco } from '../features/auth/domain/decidirTrasFalloDeRefresco';

describe('decidirTrasFalloDeRefresco', () => {
  it('cierra la sesion solo cuando el backend la rechaza', () => {
    expect(decidirTrasFalloDeRefresco(new ApiError('no autorizado', 401))).toBe(
      'cerrar_sesion',
    );
    expect(decidirTrasFalloDeRefresco(new ApiError('prohibido', 403))).toBe(
      'cerrar_sesion',
    );
  });

  it('conserva el registro del dispositivo si no hay conexion', () => {
    expect(
      decidirTrasFalloDeRefresco(new TypeError('Network request failed')),
    ).toBe('mantener_local');
  });

  it('conserva el registro si la Central esta caida', () => {
    expect(decidirTrasFalloDeRefresco(new ApiError('boom', 500))).toBe(
      'mantener_local',
    );
    expect(decidirTrasFalloDeRefresco(new ApiError('gateway', 503))).toBe(
      'mantener_local',
    );
  });

  it('ante un fallo desconocido no borra el registro', () => {
    // El registro es de una sola vez por dispositivo: perderlo por un fallo que no
    // sabemos interpretar deja a la persona sin forma de volver a entrar.
    expect(decidirTrasFalloDeRefresco(new Error('raro'))).toBe('mantener_local');
    expect(decidirTrasFalloDeRefresco(undefined)).toBe('mantener_local');
  });
});
