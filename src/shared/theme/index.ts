import { animations } from './animations';
import { darkColors, lightColors } from './colors';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export const createAppTheme = (isDark: boolean) => ({
  isDark,
  colors: isDark ? darkColors : lightColors,
  spacing,
  radius,
  shadows,
  typography,
  animations,
});

export const appTheme = createAppTheme(false);

export type AppTheme = ReturnType<typeof createAppTheme>;

export * from './paperTheme';
