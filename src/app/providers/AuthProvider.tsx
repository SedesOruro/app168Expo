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

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  accessToken: string | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
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

  const applySession = useCallback(async (session: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }): Promise<void> => {
    await tokenStorage.saveTokens(session.accessToken, session.refreshToken);
    setUser(session.user);
    setAccessToken(session.accessToken);
    setStatus('authenticated');
  }, []);

  useEffect(() => {
    let active = true;
    const restore = async (): Promise<void> => {
      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
          if (active) setStatus('guest');
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

  const signOut = useCallback(async (): Promise<void> => {
    const refreshToken = await tokenStorage.getRefreshToken();
    await authRepository.logout(refreshToken).catch(() => undefined);
    await tokenStorage.clear();
    setUser(null);
    setAccessToken(null);
    setStatus('guest');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,
      signIn,
      signUp,
      signOut,
    }),
    [accessToken, signIn, signOut, signUp, status, user],
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
