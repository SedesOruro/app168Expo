import { animations } from './animations';
import { coloresMapa, coloresTriaje, darkColors, lightColors } from './colors';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { estilosTexto, fontFamily, typography } from './typography';

export const createAppTheme = (isDark: boolean) => ({
  isDark,
  colors: isDark ? darkColors : lightColors,
  // Codigos de color que no dependen de la apariencia.
  triaje: coloresTriaje,
  mapa: coloresMapa,
  spacing,
  radius,
  shadows,
  typography,
  // Version compatible con StyleSheet, que es lo que usan las pantallas.
  estilosTexto,
  // Familias por peso: en React Native el peso se elige con la familia, no con
  // fontWeight, que no se aplica sobre fuentes personalizadas.
  fuentes: fontFamily,
  animations,
});

export const appTheme = createAppTheme(false);

export type AppTheme = ReturnType<typeof createAppTheme>;

export * from './paperTheme';
