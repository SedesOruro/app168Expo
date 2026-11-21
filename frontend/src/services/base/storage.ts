/**
 * Almacenamiento local de la PWA.
 *
 * En el APK esto era SecureStore (llavero cifrado del telefono). El navegador no
 * tiene un equivalente: se usa localStorage, decision asumida en el plan. Se
 * mantiene la misma interfaz asincrona para que el resto del codigo no cambie y
 * para poder sustituir el soporte (IndexedDB, cookies httpOnly) sin tocar a nadie.
 *
 * Todas las operaciones toleran un localStorage bloqueado (modo privado, datos
 * borrados): devuelven null o no hacen nada en lugar de romper el arranque.
 */
export type SecureStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const PREFIJO = 'e168.';

export const secureStorage: SecureStorage = {
  getItem: async (key) => {
    try {
      return window.localStorage.getItem(PREFIJO + key);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      window.localStorage.setItem(PREFIJO + key, value);
    } catch {
      // Sin almacenamiento la sesion dura lo que dure la pestana.
    }
  },
  removeItem: async (key) => {
    try {
      window.localStorage.removeItem(PREFIJO + key);
    } catch {
      // Nada que limpiar.
    }
  },
};
