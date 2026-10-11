import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import UsuarioService from "../core/system/autenticacion/usuario";
import RolService from "../core/system/autenticacion/rol";

const getAuthToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, token] = header.split(" ");
  return type === "Bearer" && token ? token : null;
};

const hydrateJwtUser = async (uid: string) => {
  const user = await UsuarioService.getById(uid);
  if (user.isFailure) throw new Error(user.error || "Usuario no encontrado");
  if (!user.getValue().props.activo) throw new Error("Usuario inactivo");

  const rol = await RolService.getById(user.getValue().props.rolId);
  if (rol.isFailure) throw new Error(rol.error || "Rol no encontrado");

  const rolValue = rol.getValue();
  return {
    uid: user.getValue().id,
    email: user.getValue().props.email,
    rol: rolValue.props.tipo,
    permisos: rolValue.getPermisos(),
    [rolValue.props.tipo]: true,
  };
};

export const checkIfAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const token = getAuthToken(req);
  if (!token) return res.status(401).json({ error: "Acceso no autorizado" });

  try {
    const user = verifyToken(token);
    const usuarioActual = await hydrateJwtUser(user.uid);
    req.authId = usuarioActual.uid;
    req.authUser = usuarioActual;
    return next();
  } catch (error) {
    return res.status(401).json({ error: String((error as Error).message) });
  }
};

export const checkIfAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  return checkIfAuthenticated(req, res, () => {
    const rol = String(req.authUser?.rol || "");
    if (rol !== "administrador") {
      return res.status(403).json({ error: "Permisos insuficientes" });
    }
    return next();
  });
};

export const checkIfOperationalStaff = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  return checkIfAuthenticated(req, res, () => {
    const rol = String(req.authUser?.rol || "");
    if (!["administrador", "operador"].includes(rol)) {
      return res.status(403).json({ error: "Permisos insuficientes" });
    }
    return next();
  });
};
