import React, { ReactElement, ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import { SocketProvider } from './SocketProvider';
import { AppThemeProvider } from './ThemeProvider';

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps): ReactElement => (
  <SafeAreaProvider>
    <AppThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <SocketProvider>{children}</SocketProvider>
        </AuthProvider>
      </QueryProvider>
    </AppThemeProvider>
  </SafeAreaProvider>
);
