import { jwtDecode } from "jwt-decode";
import { TOKEN_KEY } from "../../config/env";
import { BaseService } from "../base/BaseService";
import { BaseResponse } from "../../types/api";

export type SessionInfo = {
  id_usuario: string;
  nombre?: string;
  avatar?: string;
  username: string;
  rol: string;
  permisos: Record<string, unknown>;
  modulos: Array<{ id?: string; name?: string; path?: string; title?: string; icon?: string; color?: string }>;
  genero?: string;
  celular?: string;
};

export const registerLogin = (token: string, sessionInfo: SessionInfo): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem("auth", JSON.stringify(sessionInfo));
};

export const registerLogout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("auth");
  localStorage.removeItem("dashboardMenu");
};

export const getSessionInfoFromLocalStorage = (): SessionInfo | null => {
  const item = localStorage.getItem("auth");
  return item ? (JSON.parse(item) as SessionInfo) : null;
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    return !decoded.exp || decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    registerLogout();
    return false;
  }
};

export const doSignIn = async (email: string, password: string): Promise<BaseResponse<unknown>> => {
  const login = await BaseService.request<{ token: string }>("post", "/usuarios/login", { email, password });
  if (!login.success || !login.data?.token) return login;

  localStorage.setItem(TOKEN_KEY, login.data.token);
  const session = await BaseService.request<SessionInfo>("get", "/usuarios/sesion-info");
  if (!session.success || !session.data) {
    registerLogout();
    return session;
  }

  registerLogin(login.data.token, session.data);
  localStorage.setItem("dashboardMenu", JSON.stringify(session.data.modulos || []));
  return { success: true, msg: "Sesion iniciada" };
};

export const doSignOut = async (): Promise<BaseResponse<unknown>> => {
  registerLogout();
  return { success: true, msg: "Sesion cerrada" };
};
