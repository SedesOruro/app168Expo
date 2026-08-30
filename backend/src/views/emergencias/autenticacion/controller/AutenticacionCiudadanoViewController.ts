import { Request, Response } from "express";
import { BaseHttpController } from "../../../../base/infra/BaseHttpController";
import AutenticacionCiudadanoView, {
  ContextoPeticion,
} from "../AutenticacionCiudadanoView";

const contextoDe = (req: Request): ContextoPeticion => ({
  dispositivo: String(req.headers["user-agent"] || "").slice(0, 255) || null,
  ipOrigen: req.ip || req.socket.remoteAddress || null,
});

export class AutenticacionCiudadanoViewController extends BaseHttpController {
  async registrar(req: Request, res: Response): Promise<Response> {
    const result = await AutenticacionCiudadanoView.registrar(
      req.body,
      contextoDe(req),
    );
    if (result.isFailure) return this.fallo(res, result);
    return res.status(201).json(result.getValue());
  }

  async iniciarSesion(req: Request, res: Response): Promise<Response> {
    const result = await AutenticacionCiudadanoView.iniciarSesion(
      req.body.email,
      req.body.password,
      contextoDe(req),
    );
    if (result.isFailure) return this.fallo(res, result);
    return res.json(result.getValue());
  }

  async refrescar(req: Request, res: Response): Promise<Response> {
    const result = await AutenticacionCiudadanoView.refrescar(
      String(req.body.refreshToken || ""),
      contextoDe(req),
    );
    if (result.isFailure) return this.fallo(res, result);
    const sesion = result.getValue();
    if (!sesion)
      return res.status(401).json({ error: "Sesion expirada o revocada" });
    return res.json(sesion);
  }

  async cerrarSesion(req: Request, res: Response): Promise<Response> {
    await AutenticacionCiudadanoView.cerrarSesion(
      String(req.body.refreshToken || ""),
    );
    return res.status(204).send();
  }

  async obtenerCuenta(req: Request, res: Response): Promise<Response> {
    const result = await AutenticacionCiudadanoView.obtenerCuenta(
      req.authCiudadanoId!,
    );
    if (result.isFailure) return this.fail(res, result.error);
    const cuenta = result.getValue();
    if (!cuenta)
      return res.status(404).json({ error: "Ciudadano no encontrado" });
    return res.json(cuenta);
  }
}
