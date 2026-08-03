import { NextFunction, Request, Response } from "express";
import { Database } from "../config/database";
import { verifyToken } from "../utils/jwt";

const bearerToken = (req: Request): string | null => {
  const [type, token] = String(req.headers.authorization || "").split(" ");
  return type === "Bearer" && token ? token : null;
};

export const checkIfCitizenAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: "Acceso no autorizado" });

  try {
    const payload = verifyToken(token);
    if (payload.kind !== "citizen") {
      return res.status(401).json({ error: "Token de ciudadano requerido" });
    }

    const ciudadano = await Database.getInstance().models.ciudadano.findOne({
      where: { uuid: payload.uid, estado: "ACTIVO" },
    });
    if (!ciudadano) return res.status(401).json({ error: "Cuenta no disponible" });

    req.authCitizenId = Number(ciudadano.id);
    req.authCitizenUuid = String(ciudadano.uuid);
    return next();
  } catch (error) {
    return res.status(401).json({ error: String((error as Error).message) });
  }
};
