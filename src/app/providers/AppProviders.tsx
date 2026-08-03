import React, { ReactElement, ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import { SocketProvider } from './SocketProvider';
import { AppThemeProvider } from './ThemeProvider';
import { EmergencyFlowProvider } from '../../features/emergency/presentation/providers/EmergencyFlowProvider';

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps): ReactElement => (
  <SafeAreaProvider>
    <AppThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <EmergencyFlowProvider>
            <SocketProvider>{children}</SocketProvider>
          </EmergencyFlowProvider>
        </AuthProvider>
      </QueryProvider>
    </AppThemeProvider>
  </SafeAreaProvider>
);
