import {
  MD3DarkTheme,
  MD3LightTheme,
  configureFonts,
} from 'react-native-paper';

import { darkColors, lightColors } from './colors';
import { fontFamily } from './typography';

const fonts = configureFonts({
  config: {
    fontFamily: fontFamily.regular,
  },
});

export const paperLightTheme = {
  ...MD3LightTheme,
  fonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    secondary: lightColors.secondary,
    tertiary: lightColors.accent,
    background: lightColors.background,
    surface: lightColors.surface,
    surfaceVariant: lightColors.surfaceMuted,
    outline: lightColors.border,
    error: lightColors.danger,
    onSurface: lightColors.text,
  },
};

export const paperDarkTheme = {
  ...MD3DarkTheme,
  fonts,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    secondary: darkColors.secondary,
    tertiary: darkColors.accent,
    background: darkColors.background,
    surface: darkColors.surface,
    surfaceVariant: darkColors.surfaceMuted,
    outline: darkColors.border,
    error: darkColors.danger,
    onSurface: darkColors.text,
  },
};

export type AppPaperTheme = typeof paperLightTheme;
