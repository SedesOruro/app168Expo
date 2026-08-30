import { NextFunction, Request, Response } from "express";
import CiudadanoService from "../core/emergencias/ciudadano";
import { verifyToken } from "../utils/jwt";

const bearerToken = (req: Request): string | null => {
  const [type, token] = String(req.headers.authorization || "").split(" ");
  return type === "Bearer" && token ? token : null;
};

export const checkIfCiudadanoAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: "Acceso no autorizado" });

  try {
    const payload = verifyToken(token);
    if (payload.kind !== "ciudadano") {
      return res.status(401).json({ error: "Token de ciudadano requerido" });
    }

    const cuenta = await CiudadanoService.buscarActivoPorUuid(payload.uid);
    if (cuenta.isFailure || !cuenta.getValue())
      return res.status(401).json({ error: "Cuenta no disponible" });

    const ciudadano = cuenta.getValue()!;
    req.authCiudadanoId = ciudadano.id;
    req.authCiudadanoUuid = ciudadano.uuid;
    return next();
  } catch (error) {
    return res.status(401).json({ error: String((error as Error).message) });
  }
};
