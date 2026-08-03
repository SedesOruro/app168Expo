import { UsuarioAutenticado } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      authId?: string;
      authUser?: UsuarioAutenticado;
      authError?: string;
      authCitizenId?: number;
      authCitizenUuid?: string;
    }
  }
}

export {};
