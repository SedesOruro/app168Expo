import * as SecureStore from 'expo-secure-store';

export type SecureStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const serviceFor = (key: string): string => `desarrollo-movil.${key}`;

export const secureStorage: SecureStorage = {
  getItem: key =>
    SecureStore.getItemAsync(key, {
      keychainService: serviceFor(key),
    }),
  setItem: async (key, value) => {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      keychainService: serviceFor(key),
    });
  },
  removeItem: async key => {
    await SecureStore.deleteItemAsync(key, {
      keychainService: serviceFor(key),
    });
  },
};
