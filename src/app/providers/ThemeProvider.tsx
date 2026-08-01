import React, { ReactElement, ReactNode, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';

import {
  createAppTheme,
  paperDarkTheme,
  paperLightTheme,
} from '../../shared/theme';

type AppThemeProviderProps = {
  children: ReactNode;
};

export const AppThemeProvider = ({
  children,
}: AppThemeProviderProps): ReactElement => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useMemo(() => createAppTheme(isDark), [isDark]);
  const paperTheme = isDark ? paperDarkTheme : paperLightTheme;

  return (
    <StyledThemeProvider theme={theme}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </StyledThemeProvider>
  );
};
