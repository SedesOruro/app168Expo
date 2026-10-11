import { Request, Response } from "express";
import { BaseHttpController } from "../../../../base/infra/BaseHttpController";
import { routeParam } from "../../../../utils/routeParam";
import OperacionesView from "../OperacionesView";

/**
 * Controlador HTTP de operaciones. No conoce Sequelize: delega en la vista, que
 * a su vez compone los servicios de cada agregado.
 */
export class OperacionesEmergenciaViewController extends BaseHttpController {
  async dashboard(_req: Request, res: Response): Promise<Response> {
    const data = await OperacionesView.obtenerDashboard();
    if (data.isFailure) return this.fail(res, data.error);
    return res.json(data.getValue());
  }

  async listarEmergencias(req: Request, res: Response): Promise<Response> {
    const data = await OperacionesView.listarEmergencias(req.query);
    if (data.isFailure) return this.fail(res, data.error);
    return res.json(data.getValue());
  }

  async obtenerEmergencia(req: Request, res: Response): Promise<Response> {
    const data = await OperacionesView.obtenerEmergencia(routeParam(req.params.uuid));
    if (data.isFailure) return this.fail(res, data.error);
    const detalle = data.getValue();
    if (!detalle)
      return res.status(404).json({ error: "Emergencia no encontrada" });
    return res.json(detalle);
  }

  async actualizarEmergencia(req: Request, res: Response): Promise<Response> {
    const result = await OperacionesView.actualizarEmergencia(
      routeParam(req.params.uuid),
      {
        statusCode: req.body.statusCode,
        operatorId: req.body.operatorId,
        observation: req.body.observation,
        tieneOperador: Object.prototype.hasOwnProperty.call(
          req.body,
          "operatorId",
        ),
      },
      req.authId,
    );
    if (result.isFailure) return this.fallo(res, result);
    return res.json({ updated: true });
  }

  async listarEstados(_req: Request, res: Response): Promise<Response> {
    const data = await OperacionesView.listarEstados();
    if (data.isFailure) return this.fail(res, data.error);
    return res.json(data.getValue());
  }

  async listarOperadores(_req: Request, res: Response): Promise<Response> {
    const data = await OperacionesView.listarOperadores();
    if (data.isFailure) return this.fail(res, data.error);
    return res.json(data.getValue());
  }

  async listarCiudadanos(req: Request, res: Response): Promise<Response> {
    const data = await OperacionesView.listarCiudadanos(req.query);
    if (data.isFailure) return this.fail(res, data.error);
    return res.json(data.getValue());
  }

  async cambiarEstadoCiudadano(req: Request, res: Response): Promise<Response> {
    const activo = req.body.active !== false;
    const result = await OperacionesView.cambiarEstadoCiudadano(
      routeParam(req.params.uuid),
      activo,
    );
    if (result.isFailure) return this.fallo(res, result);
    return res.json({ updated: true, status: activo ? "ACTIVO" : "INACTIVO" });
  }

  async restablecerPasswordCiudadano(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const result = await OperacionesView.restablecerPasswordCiudadano(
      routeParam(req.params.uuid),
    );
    if (result.isFailure) return this.fallo(res, result);
    return res.json({ updated: true });
  }

  async listarCentrosSalud(req: Request, res: Response): Promise<Response> {
    const data = await OperacionesView.listarCentrosSalud(req.query);
    if (data.isFailure) return this.fail(res, data.error);
    return res.json(data.getValue());
  }

  async crearCentroSalud(req: Request, res: Response): Promise<Response> {
    const data = await OperacionesView.crearCentroSalud(req.body);
    if (data.isFailure) return this.fallo(res, data);
    return res.status(201).json(data.getValue());
  }

  async actualizarCentroSalud(req: Request, res: Response): Promise<Response> {
    const data = await OperacionesView.actualizarCentroSalud(
      routeParam(req.params.uuid),
      req.body,
    );
    if (data.isFailure) return this.fail(res, data.error);
    const fila = data.getValue();
    if (!fila)
      return res.status(404).json({ error: "Centro de salud no encontrado" });
    return res.json(fila);
  }

  async desactivarCentroSalud(req: Request, res: Response): Promise<Response> {
    const result = await OperacionesView.desactivarCentroSalud(routeParam(req.params.uuid));
    if (result.isFailure) return this.fallo(res, result);
    return res.json({ deleted: true });
  }
}
