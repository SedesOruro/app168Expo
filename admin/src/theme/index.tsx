import React, { createContext, useContext, useMemo, useState } from 'react';
// material
import { CssBaseline } from '@mui/material';
import { ThemeProvider as MUIThemeProvider, createTheme, StyledEngineProvider, ThemeOptions } from '@mui/material/styles';
//
import { getPalette } from './palette';
import typography from './typography';
import componentsOverride from './overrides';
import shadows, { customShadows } from './shadows';

// ----------------------------------------------------------------------
type Props = {
    children?: React.ReactNode;
};

type ThemeMode = 'light' | 'dark';

const ThemeModeContext = createContext({
    mode: 'light' as ThemeMode,
    toggleMode: (() => undefined) as () => void
});

export const useThemeMode = () => useContext(ThemeModeContext);

declare module '@mui/material/styles' {
    interface PaletteColor {
        lighter: string;
        darker: string;
    }
    interface SimplePaletteColorOptions {
        lighter?: string;
        darker?: string;
    }
    interface Palette {
        gradients: ReturnType<typeof getPalette>['gradients'];
        chart: {
            violet: string[];
            blue: string[];
            green: string[];
            yellow: string[];
            red: string[];
        };
    }
    interface PaletteOptions {
        gradients?: ReturnType<typeof getPalette>['gradients'];
        chart?: ReturnType<typeof getPalette>['chart'];
    }
    interface TypeText {
        tertiary: string;
    }
    interface TypeBackground {
        neutral: string;
    }
    interface Theme {
        customShadows: typeof customShadows;
    }
    interface ThemeOptions {
        customShadows?: typeof customShadows;
    }
}

declare module '@mui/material/styles' {
    interface TypographyVariants {
        h0: React.CSSProperties;
    }

    // allow configuration using `createTheme`
    interface TypographyVariantsOptions {
        h0?: React.CSSProperties;
    }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        h0: true;
    }
}

export default function ThemeProvider({ children }: Props) {
    const [mode, setMode] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('theme-mode');
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const themeOptions = useMemo<ThemeOptions>(
        () => ({
            palette: getPalette(mode),
            shape: { borderRadius: 4 },
            typography,
            shadows,
            customShadows
        }),
        [mode]
    );

    const theme = createTheme(themeOptions);
    theme.components = componentsOverride(theme);
    const themeMode = useMemo(
        () => ({
            mode,
            toggleMode: () =>
                setMode((current) => {
                    const next = current === 'light' ? 'dark' : 'light';
                    localStorage.setItem('theme-mode', next);
                    return next;
                })
        }),
        [mode]
    );

    return (
        <StyledEngineProvider injectFirst>
            <MUIThemeProvider theme={theme}>
                <ThemeModeContext.Provider value={themeMode}>
                    <CssBaseline />
                    {children}
                </ThemeModeContext.Provider>
            </MUIThemeProvider>
        </StyledEngineProvider>
    );
}
