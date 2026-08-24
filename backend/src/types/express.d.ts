import { UsuarioAutenticado } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      authId?: string;
      authUser?: UsuarioAutenticado;
      authError?: string;
      authCiudadanoId?: number;
      authCiudadanoUuid?: string;
    }
  }
}

export {};
