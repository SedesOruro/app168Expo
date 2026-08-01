import React, { ReactElement } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../../features/auth/presentation/screens/LoginScreen';
import { RegisterScreen } from '../../features/auth/presentation/screens/RegisterScreen';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = (): ReactElement => (
  <Stack.Navigator initialRouteName="Register" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);
