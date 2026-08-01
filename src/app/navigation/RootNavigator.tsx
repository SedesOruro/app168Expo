import React, { ReactElement } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { useAuth } from '../providers/AuthProvider';
import { AuthNavigator } from './AuthNavigator';
import { linking } from './linking';
import { MainNavigator } from './MainNavigator';

export const RootNavigator = (): ReactElement => {
  const { status } = useAuth();

  if (status === 'checking') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      {status === 'authenticated' ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
