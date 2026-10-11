import React, {
  ReactElement,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { emergencyApi, type EmergencyRecord } from '../../data/EmergencyApi';
import { getCurrentCoordinates } from '../../data/locationService';

/**
 * Estado del alta de la emergencia que se lanza al pulsar el boton 168. La
 * llamada sale primero; el registro con ubicacion corre mientras se habla.
 */
export type EstadoRegistro = 'sin_iniciar' | 'registrando' | 'registrada' | 'fallida';

type EmergencyFlowContextValue = {
  currentEmergency: EmergencyRecord | null;
  estadoRegistro: EstadoRegistro;
  errorRegistro: string | null;
  registrarAlerta: () => Promise<void>;
  setCurrentEmergency: (emergency: EmergencyRecord | null) => void;
};

const EmergencyFlowContext = createContext<EmergencyFlowContextValue | undefined>(
  undefined,
);

const nuevaClave = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, caracter => {
    const aleatorio = (Math.random() * 16) | 0;
    const valor = caracter === 'x' ? aleatorio : (aleatorio & 0x3) | 0x8;
    return valor.toString(16);
  });

export const EmergencyFlowProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const [currentEmergency, setCurrentEmergency] =
    useState<EmergencyRecord | null>(null);
  const [estadoRegistro, setEstadoRegistro] = useState<EstadoRegistro>('sin_iniciar');
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null);
  // Una misma clave por alerta: si se reintenta tras un fallo de red, el
  // backend devuelve la emergencia ya creada en vez de duplicarla.
  const claveAlerta = useRef<string | null>(null);

  const registrarAlerta = useCallback(async (): Promise<void> => {
    claveAlerta.current ??= nuevaClave();
    setEstadoRegistro('registrando');
    setErrorRegistro(null);
    try {
      const location = await getCurrentCoordinates();
      const emergency = await emergencyApi.createEmergency({
        ...location,
        idempotencyKey: claveAlerta.current,
        typeCode: 'MEDICA',
        severity: 'ALTA',
        canSpeak: true,
        locationConfirmed: true,
        flow: 'direct',
        triage: {},
      });
      setCurrentEmergency(emergency);
      setEstadoRegistro('registrada');
      claveAlerta.current = null;
    } catch (error) {
      setErrorRegistro(
        error instanceof Error ? error.message : 'No se pudo registrar la alerta.',
      );
      setEstadoRegistro('fallida');
    }
  }, []);

  const value = useMemo(
    () => ({
      currentEmergency,
      estadoRegistro,
      errorRegistro,
      registrarAlerta,
      setCurrentEmergency,
    }),
    [currentEmergency, errorRegistro, estadoRegistro, registrarAlerta],
  );
  return (
    <EmergencyFlowContext.Provider value={value}>
      {children}
    </EmergencyFlowContext.Provider>
  );
};

export const useEmergencyFlow = (): EmergencyFlowContextValue => {
  const context = useContext(EmergencyFlowContext);
  if (!context) {
    throw new Error('useEmergencyFlow must be used inside EmergencyFlowProvider');
  }
  return context;
};
