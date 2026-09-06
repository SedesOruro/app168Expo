import React, { ReactElement, useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { PresentacionScreen } from '../../features/onboarding/presentation/screens/PresentacionScreen';
import { useAuth } from '../providers/AuthProvider';
import { AuthNavigator } from './AuthNavigator';
import { linking } from './linking';
import { MainNavigator } from './MainNavigator';

export const RootNavigator = (): ReactElement => {
  const { status, explorando } = useAuth();
  const [presentacionVista, setPresentacionVista] = useState(false);
  const terminarPresentacion = useCallback(() => setPresentacionVista(true), []);

  if (!presentacionVista) {
    return <PresentacionScreen onTerminar={terminarPresentacion} />;
  }

  if (status === 'checking') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Quien salto el registro entra a la aplicacion como visitante. El boton de
  // emergencia le pedira registrarse cuando lo pulse, no antes.
  const puedeEntrar = status === 'authenticated' || explorando;

  return (
    <NavigationContainer linking={linking}>
      {puedeEntrar ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
