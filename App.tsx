import React, { ReactElement, useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { initApp } from './src/app/bootstrap/init';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { AppProviders } from './src/app/providers/AppProviders';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const App = (): ReactElement | null => {
  const [fontsLoaded, fontError] = useFonts({
    'WorkSans-Regular': require('./src/shared/assets/fonts/WorkSans-Regular.ttf'),
    'WorkSans-Medium': require('./src/shared/assets/fonts/WorkSans-Medium.ttf'),
    'WorkSans-SemiBold': require('./src/shared/assets/fonts/WorkSans-SemiBold.ttf'),
    'WorkSans-Bold': require('./src/shared/assets/fonts/WorkSans-Bold.ttf'),
  });

  useEffect(() => {
    initApp().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
};

export default App;
