import React, {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { User } from '../../features/auth/domain/entities/User';
import type {
  LoginCredentials,
  RegisterPayload,
} from '../../features/auth/domain/repositories/AuthRepository';

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

const demoUser: User = {
  id: 'demo-168',
  name: 'Marilyn Susan Huanca Gutierrez',
  email: 'demo@168.gob.bo',
};

export const AuthProvider = ({ children }: AuthProviderProps): ReactElement => {
  const [status, setStatus] = useState<AuthStatus>('guest');
  const [user, setUser] = useState<User | null>(null);

  const openDemoSession = useCallback(async (): Promise<void> => {
    setUser(demoUser);
    setStatus('authenticated');
  }, []);

  const signIn = useCallback(
    async (_credentials: LoginCredentials): Promise<void> => {
      await openDemoSession();
    },
    [openDemoSession],
  );

  const signUp = useCallback(
    async (_payload: RegisterPayload): Promise<void> => {
      await openDemoSession();
    },
    [openDemoSession],
  );

  const signOut = useCallback(async (): Promise<void> => {
    setUser(null);
    setStatus('guest');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken: status === 'authenticated' ? 'demo-token' : null,
      signIn,
      signUp,
      signOut,
    }),
    [signIn, signOut, signUp, status, user],
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
