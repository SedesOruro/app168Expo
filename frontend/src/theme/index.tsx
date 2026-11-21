import { createContext, type ReactElement, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createTheme, CssBaseline, ThemeProvider as MuiThemeProvider, useMediaQuery } from '@mui/material';
import WorkSansBold from '../assets/fonts/WorkSans-Bold.ttf';
import WorkSansMedium from '../assets/fonts/WorkSans-Medium.ttf';
import WorkSansRegular from '../assets/fonts/WorkSans-Regular.ttf';
import WorkSansSemiBold from '../assets/fonts/WorkSans-SemiBold.ttf';
import { secureStorage } from '../services/base/storage';
import { darkColors, lightColors, type AppColorTokens } from './colors';
import { radius, shadows } from './tokens';

declare module '@mui/material/styles' {
  interface Palette {
    app: AppColorTokens;
  }
  interface PaletteOptions {
    app?: AppColorTokens;
  }
}

/**
 * Preferencia de apariencia, igual que en el APK: por defecto claro aunque el
 * sistema este en oscuro; solo cambia si la persona lo elige.
 */
export type PreferenciaTema = 'claro' | 'oscuro' | 'sistema';

const CLAVE_PREFERENCIA = 'preferencia_tema';

type TemaContextValue = {
  preferencia: PreferenciaTema;
  esOscuro: boolean;
  cambiarPreferencia: (valor: PreferenciaTema) => Promise<void>;
};

const TemaContext = createContext<TemaContextValue | undefined>(undefined);

const fuente = (familia: string, peso: number, archivo: string): string => `
  @font-face {
    font-family: '${familia}';
    font-style: normal;
    font-weight: ${peso};
    font-display: swap;
    src: url(${archivo}) format('truetype');
  }
`;

const crearTema = (esOscuro: boolean) => {
  const c = esOscuro ? darkColors : lightColors;

  return createTheme({
    palette: {
      mode: esOscuro ? 'dark' : 'light',
      primary: { main: c.primary, dark: c.primaryDark, contrastText: c.onFill },
      secondary: { main: c.secondary, dark: c.secondaryDark, contrastText: c.onFill },
      error: { main: c.danger, contrastText: c.onFill },
      warning: { main: c.warning },
      success: { main: c.success },
      background: { default: c.background, paper: c.surface },
      text: { primary: c.text, secondary: c.textMuted },
      divider: c.border,
      app: c,
    },
    shape: { borderRadius: radius.md },
    typography: {
      fontFamily: "'Work Sans', system-ui, sans-serif",
      h1: { fontWeight: 700, fontSize: 28, lineHeight: '34px' },
      h2: { fontWeight: 600, fontSize: 22, lineHeight: '28px' },
      h3: { fontWeight: 600, fontSize: 18, lineHeight: '24px' },
      h4: { fontWeight: 600, fontSize: 16, lineHeight: '22px' },
      body1: { fontSize: 16, lineHeight: '22px' },
      body2: { fontSize: 14, lineHeight: '20px' },
      caption: { fontWeight: 500, fontSize: 12, lineHeight: '16px' },
      button: { fontWeight: 600, textTransform: 'none', fontSize: 16 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          ${fuente('Work Sans', 400, WorkSansRegular)}
          ${fuente('Work Sans', 500, WorkSansMedium)}
          ${fuente('Work Sans', 600, WorkSansSemiBold)}
          ${fuente('Work Sans', 700, WorkSansBold)}
          html, body, #root { height: 100%; }
          body { background: ${c.background}; -webkit-tap-highlight-color: transparent; overscroll-behavior-y: none; }
        `,
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: radius.md, minHeight: 48 } },
      },
      MuiCard: {
        styleOverrides: { root: { borderRadius: radius.lg, boxShadow: shadows.sm, backgroundImage: 'none' } },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiTextField: { defaultProps: { fullWidth: true } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: radius.md, background: c.surface } } },
      MuiChip: { styleOverrides: { root: { borderRadius: radius.pill, fontWeight: 600 } } },
      MuiDialog: { styleOverrides: { paper: { borderRadius: radius.xl } } },
    },
  });
};

export default function ThemeProvider({ children }: { children: ReactNode }): ReactElement {
  const sistemaOscuro = useMediaQuery('(prefers-color-scheme: dark)');
  const [preferencia, setPreferencia] = useState<PreferenciaTema>('claro');

  useEffect(() => {
    secureStorage.getItem(CLAVE_PREFERENCIA).then((guardada) => {
      if (guardada === 'claro' || guardada === 'oscuro' || guardada === 'sistema') setPreferencia(guardada);
    });
  }, []);

  const cambiarPreferencia = useCallback(async (valor: PreferenciaTema) => {
    setPreferencia(valor);
    await secureStorage.setItem(CLAVE_PREFERENCIA, valor);
  }, []);

  const esOscuro = preferencia === 'oscuro' || (preferencia === 'sistema' && sistemaOscuro);
  const theme = useMemo(() => crearTema(esOscuro), [esOscuro]);
  const valor = useMemo(() => ({ preferencia, esOscuro, cambiarPreferencia }), [preferencia, esOscuro, cambiarPreferencia]);

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', esOscuro ? darkColors.background : lightColors.primary);
  }, [esOscuro]);

  return (
    <TemaContext.Provider value={valor}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </TemaContext.Provider>
  );
}

export const useTemaApp = (): TemaContextValue => {
  const contexto = useContext(TemaContext);
  if (!contexto) throw new Error('useTemaApp debe usarse dentro de ThemeProvider');
  return contexto;
};
