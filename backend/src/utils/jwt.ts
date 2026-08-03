import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface UsuarioAutenticado {
  uid: string;
  email?: string;
  rol?: string;
  permisos?: Record<string, unknown>;
  [key: string]: unknown;
}

export const signToken = (
  user: UsuarioAutenticado,
  options?: SignOptions,
): string => {
  return jwt.sign({ ...user, sub: user.uid }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
    issuer: env.jwt.issuer,
    ...options,
  } as SignOptions);
};

export const verifyToken = (token: string): UsuarioAutenticado => {
  return jwt.verify(token, env.jwt.secret, {
    issuer: env.jwt.issuer,
  }) as UsuarioAutenticado;
};
