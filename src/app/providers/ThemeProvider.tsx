import React, {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';

import { secureStorage } from '../../shared/storage/secureStorage';
import {
  createAppTheme,
  paperDarkTheme,
  paperLightTheme,
} from '../../shared/theme';

/**
 * Preferencia de apariencia. El modo oscuro es opcional y no se activa solo: por
 * defecto la aplicacion va en claro aunque el telefono este en oscuro, y solo
 * cambia si la persona lo elige. `sistema` queda disponible para quien prefiera
 * que siga al telefono.
 */
export type PreferenciaTema = 'claro' | 'oscuro' | 'sistema';

const CLAVE_PREFERENCIA = 'preferencia_tema';
const POR_DEFECTO: PreferenciaTema = 'claro';

type TemaContextValue = {
  preferencia: PreferenciaTema;
  /** Cierto cuando la apariencia efectiva es oscura, sea por eleccion o por sistema. */
  esOscuro: boolean;
  cambiarPreferencia: (valor: PreferenciaTema) => Promise<void>;
};

const TemaContext = createContext<TemaContextValue | undefined>(undefined);

type AppThemeProviderProps = {
  children: ReactNode;
};

export const AppThemeProvider = ({
  children,
}: AppThemeProviderProps): ReactElement => {
  const esquemaSistema = useColorScheme();
  const [preferencia, setPreferencia] = useState<PreferenciaTema>(POR_DEFECTO);

  useEffect(() => {
    let activo = true;
    secureStorage
      .getItem(CLAVE_PREFERENCIA)
      .then(guardada => {
        if (!activo) return;
        if (guardada === 'claro' || guardada === 'oscuro' || guardada === 'sistema') {
          setPreferencia(guardada);
        }
      })
      .catch(() => undefined);
    return () => {
      activo = false;
    };
  }, []);

  const cambiarPreferencia = useCallback(
    async (valor: PreferenciaTema): Promise<void> => {
      setPreferencia(valor);
      await secureStorage.setItem(CLAVE_PREFERENCIA, valor).catch(() => undefined);
    },
    [],
  );

  const esOscuro =
    preferencia === 'oscuro' ||
    (preferencia === 'sistema' && esquemaSistema === 'dark');

  const theme = useMemo(() => createAppTheme(esOscuro), [esOscuro]);
  const paperTheme = esOscuro ? paperDarkTheme : paperLightTheme;

  const valor = useMemo<TemaContextValue>(
    () => ({ preferencia, esOscuro, cambiarPreferencia }),
    [cambiarPreferencia, esOscuro, preferencia],
  );

  return (
    <TemaContext.Provider value={valor}>
      <StyledThemeProvider theme={theme}>
        <PaperProvider theme={paperTheme}>{children}</PaperProvider>
      </StyledThemeProvider>
    </TemaContext.Provider>
  );
};

export const useTemaApp = (): TemaContextValue => {
  const contexto = useContext(TemaContext);

  if (contexto === undefined) {
    throw new Error('useTemaApp debe usarse dentro de AppThemeProvider');
  }

  return contexto;
};
