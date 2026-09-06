import { useCallback, useEffect, useRef, useState } from 'react';

import { secureStorage } from '../../../../shared/storage/secureStorage';

const CLAVE_BORRADOR = 'borrador_registro';

export type DatosRegistro = {
  names: string;
  surnames: string;
  document: string;
  complement: string;
  birthDate: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  contactName: string;
  contactPhone: string;
};

export const datosIniciales: DatosRegistro = {
  names: '',
  surnames: '',
  document: '',
  complement: '',
  birthDate: '',
  address: '',
  phone: '',
  email: '',
  password: '',
  contactName: '',
  contactPhone: '',
};

/**
 * Conserva lo escrito en el formulario para que no se pierda al plegar una seccion
 * ni al cerrar la aplicacion, que es lo que promete "se guardan solas".
 *
 * La contrasena se excluye a proposito del borrador: guardarla en disco sin que la
 * cuenta exista todavia no aporta nada y deja una credencial en claro esperando.
 * Al restaurar el borrador el campo vuelve vacio y hay que escribirla de nuevo.
 */
export const useBorradorRegistro = (): {
  datos: DatosRegistro;
  cargando: boolean;
  actualizar: (campo: keyof DatosRegistro, valor: string) => void;
  limpiar: () => Promise<void>;
} => {
  const [datos, setDatos] = useState<DatosRegistro>(datosIniciales);
  const [cargando, setCargando] = useState(true);
  const restaurado = useRef(false);

  useEffect(() => {
    let activo = true;
    secureStorage
      .getItem(CLAVE_BORRADOR)
      .then(crudo => {
        if (!activo || !crudo) return;
        try {
          const guardado = JSON.parse(crudo) as Partial<DatosRegistro>;
          setDatos({ ...datosIniciales, ...guardado, password: '' });
        } catch {
          // Un borrador ilegible no debe impedir registrarse: se descarta.
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (activo) {
          restaurado.current = true;
          setCargando(false);
        }
      });
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!restaurado.current) return;
    const { password: _descartada, ...sinPassword } = datos;
    secureStorage
      .setItem(CLAVE_BORRADOR, JSON.stringify(sinPassword))
      .catch(() => undefined);
  }, [datos]);

  const actualizar = useCallback(
    (campo: keyof DatosRegistro, valor: string): void => {
      setDatos(actuales => ({ ...actuales, [campo]: valor }));
    },
    [],
  );

  const limpiar = useCallback(async (): Promise<void> => {
    setDatos(datosIniciales);
    await secureStorage.removeItem(CLAVE_BORRADOR).catch(() => undefined);
  }, []);

  return { datos, cargando, actualizar, limpiar };
};
