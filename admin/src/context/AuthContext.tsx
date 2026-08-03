import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { doSignIn, doSignOut, getSessionInfoFromLocalStorage, isAuthenticated, SessionInfo } from "../services/auth/AuthService";

type AuthContextValue = {
  authenticated: boolean;
  session: SessionInfo | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [session, setSession] = useState<SessionInfo | null>(getSessionInfoFromLocalStorage());

  useEffect(() => {
    const handleUnauthorized = () => {
      doSignOut();
      setAuthenticated(false);
      setSession(null);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      authenticated,
      session,
      login: async (email, password) => {
        const result = await doSignIn(email, password);
        setAuthenticated(result.success);
        setSession(result.success ? getSessionInfoFromLocalStorage() : null);
        return result.success;
      },
      logout: async () => {
        await doSignOut();
        setAuthenticated(false);
        setSession(null);
      },
      refreshSession: () => setSession(getSessionInfoFromLocalStorage())
    }),
    [authenticated, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
