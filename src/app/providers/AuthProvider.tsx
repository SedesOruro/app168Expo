import React, {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';

import type { User } from '../../features/auth/domain/entities/User';
import type {
  LoginCredentials,
  RegisterPayload,
} from '../../features/auth/domain/repositories/AuthRepository';
import { AuthApi } from '../../features/auth/data/datasources/AuthApi';
import { TokenStorage } from '../../features/auth/data/datasources/TokenStorage';
import { AuthRepositoryImpl } from '../../features/auth/data/repositories/AuthRepositoryImpl';
import { httpClient } from '../../shared/api/httpClient';
import { secureStorage } from '../../shared/storage/secureStorage';

type AuthStatus = 'checking' | 'authenticated' | 'guest';

/**
 * Clave del modo exploracion: quien pulsa "Saltar" en el registro puede recorrer
 * la aplicacion sin cuenta. Se persiste para no volver a mostrarle el registro en
 * cada arranque. El boton de emergencia sigue exigiendo registro: `pedirRegistro`
 * devuelve a esa persona al formulario cuando lo intenta.
 */
const CLAVE_EXPLORACION = 'modo_exploracion';

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  accessToken: string | null;
  /** Cierto cuando se salto el registro y se esta recorriendo la app sin cuenta. */
  explorando: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  /** Salta el registro y entra a la aplicacion como visitante. */
  saltarRegistro: () => Promise<void>;
  /** Saca del modo exploracion para devolver a la persona al registro. */
  pedirRegistro: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const tokenStorage = new TokenStorage(secureStorage);
const authRepository = new AuthRepositoryImpl(new AuthApi(httpClient));

export const AuthProvider = ({ children }: AuthProviderProps): ReactElement => {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [explorando, setExplorando] = useState(false);

  const applySession = useCallback(async (session: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }): Promise<void> => {
    await tokenStorage.saveTokens(session.accessToken, session.refreshToken);
    setUser(session.user);
    setAccessToken(session.accessToken);
    // Al registrarse o entrar deja de ser visitante.
    setExplorando(false);
    await secureStorage.removeItem(CLAVE_EXPLORACION).catch(() => undefined);
    setStatus('authenticated');
  }, []);

  useEffect(() => {
    let active = true;
    const restore = async (): Promise<void> => {
      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
          const saltado = await secureStorage
            .getItem(CLAVE_EXPLORACION)
            .catch(() => null);
          if (active) {
            setExplorando(saltado === 'true');
            setStatus('guest');
          }
          return;
        }
        const session = await authRepository.refreshToken(refreshToken);
        if (active) await applySession(session);
      } catch {
        await tokenStorage.clear();
        if (active) {
          setUser(null);
          setAccessToken(null);
          setStatus('guest');
        }
      }
    };
    restore().catch(() => setStatus('guest'));
    return () => {
      active = false;
    };
  }, [applySession]);

  const signIn = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      await applySession(await authRepository.login(credentials));
    },
    [applySession],
  );

  const signUp = useCallback(
    async (payload: RegisterPayload): Promise<void> => {
      await applySession(await authRepository.register(payload));
    },
    [applySession],
  );

  const saltarRegistro = useCallback(async (): Promise<void> => {
    await secureStorage.setItem(CLAVE_EXPLORACION, 'true').catch(() => undefined);
    setExplorando(true);
    setStatus('guest');
  }, []);

  const pedirRegistro = useCallback(async (): Promise<void> => {
    await secureStorage.removeItem(CLAVE_EXPLORACION).catch(() => undefined);
    setExplorando(false);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    const refreshToken = await tokenStorage.getRefreshToken();
    await authRepository.logout(refreshToken).catch(() => undefined);
    await tokenStorage.clear();
    await secureStorage.removeItem(CLAVE_EXPLORACION).catch(() => undefined);
    setUser(null);
    setAccessToken(null);
    setExplorando(false);
    setStatus('guest');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,
      explorando,
      signIn,
      signUp,
      signOut,
      saltarRegistro,
      pedirRegistro,
    }),
    [
      accessToken,
      explorando,
      pedirRegistro,
      saltarRegistro,
      signIn,
      signOut,
      signUp,
      status,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
