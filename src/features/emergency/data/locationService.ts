import * as Location from 'expo-location';

import type { Coordinates } from './EmergencyApi';

export const getCurrentCoordinates = async (): Promise<Coordinates> => {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Debe permitir la ubicacion para enviar una emergencia.');
  }
  const lastKnown = await Location.getLastKnownPositionAsync({
    maxAge: 60_000,
    requiredAccuracy: 100,
  });
  const location =
    lastKnown ??
    (await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    }));
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy,
  };
};
