import { decidirCanalDeEmergencia } from '../features/emergency/domain/decidirCanalDeEmergencia';

describe('decidirCanalDeEmergencia', () => {
  it('usa la aplicacion cuando hay internet', () => {
    expect(
      decidirCanalDeEmergencia({ isConnected: true, isInternetReachable: true }),
    ).toBe('app');
  });

  it('ofrece llamar cuando el telefono no tiene conexion', () => {
    expect(
      decidirCanalDeEmergencia({ isConnected: false, isInternetReachable: false }),
    ).toBe('llamada');
  });

  it('ofrece llamar cuando hay red pero internet no responde', () => {
    // Wifi conectado a un router sin salida, o datos activos sin cobertura util.
    expect(
      decidirCanalDeEmergencia({ isConnected: true, isInternetReachable: false }),
    ).toBe('llamada');
  });

  it('usa la aplicacion mientras el sistema aun comprueba el alcance', () => {
    // isInternetReachable llega null hasta que Android termina el sondeo; tratarlo
    // como "sin internet" mandaria a llamar a quien si podia enviar la alerta.
    expect(
      decidirCanalDeEmergencia({ isConnected: true, isInternetReachable: null }),
    ).toBe('app');
  });

  it('usa la aplicacion si no se pudo consultar el estado', () => {
    expect(decidirCanalDeEmergencia(null)).toBe('app');
    expect(decidirCanalDeEmergencia({})).toBe('app');
  });
});
