import crypto from "crypto";
import { Request, Response } from "express";
import mime from "mime-types";
import { BaseHttpController } from "../../../../base/infra/BaseHttpController";
import { storageProvider } from "../../../../storage/storage.provider";
import { routeParam } from "../../../../utils/routeParam";
import CiudadanoView from "../CiudadanoView";

/**
 * Controlador de la app movil. La persistencia vive en los servicios de cada
 * agregado; aqui solo quedan traduccion HTTP y la subida de archivos, que es
 * responsabilidad del proveedor de almacenamiento, no de la base de datos.
 */
export class CiudadanoViewController extends BaseHttpController {
  async subirArchivo(req: Request, res: Response): Promise<Response> {
    if (!req.file) return res.status(400).json({ error: "file es requerido" });
    if (!/^(image|audio)\//.test(req.file.mimetype))
      return res
        .status(415)
        .json({ error: "Solo se permiten imagenes o audios" });

    const extensionDetectada = mime.extension(req.file.mimetype);
    const extension = extensionDetectada ? `.${extensionDetectada}` : "";
    const nombre = `${req.authCiudadanoUuid}-${crypto.randomUUID()}${extension}`;
    const archivo = await storageProvider.upload(nombre, req.file.buffer);
    return res
      .status(201)
      .json({ file: archivo, name: nombre, mimeType: req.file.mimetype });
  }

  async listarTiposEmergencia(_req: Request, res: Response): Promise<Response> {
    const data = await CiudadanoView.listarTiposEmergencia();
    if (data.isFailure) return this.fail(res, data.error);
    return res.json(data.getValue());
  }

  async listarCentrosCercanos(req: Request, res: Response): Promise<Response> {
    const data = await CiudadanoView.buscarCentrosCercanos(req.query);
    if (data.isFailure) return this.fail(res, data.error);
    return res.json(data.getValue());
  }

  async obtenerPerfil(req: Request, res: Response): Promise<Response> {
    const data = await CiudadanoView.obtenerPerfil(req.authCiudadanoId!);
    if (data.isFailure) return this.fail(res, data.error);
    const perfil = data.getValue();
    if (!perfil)
      return res.status(404).json({ error: "Ciudadano no encontrado" });
    return res.json(perfil);
  }

  async actualizarPerfil(req: Request, res: Response): Promise<Response> {
    const result = await CiudadanoView.actualizarPerfil(
      req.authCiudadanoId!,
      req.body,
    );
    if (result.isFailure) return this.fallo(res, result);
    return res.json({ updated: true });
  }

  async crearEmergencia(req: Request, res: Response): Promise<Response> {
    const result = await CiudadanoView.registrarEmergencia(
      req.authCiudadanoId!,
      req.body,
    );
    if (result.isFailure) return this.fallo(res, result);

    const { uuid, creada } = result.getValue();
    const detalle = await CiudadanoView.obtenerEmergencia(
      uuid,
      req.authCiudadanoId!,
    );
    if (detalle.isFailure) return this.fail(res, detalle.error);
    return res.status(creada ? 201 : 200).json(detalle.getValue());
  }

  async listarEmergencias(req: Request, res: Response): Promise<Response> {
    const data = await CiudadanoView.listarEmergencias(req.authCiudadanoId!);
    if (data.isFailure) return this.fail(res, data.error);
    return res.json(data.getValue());
  }

  async obtenerEmergencia(req: Request, res: Response): Promise<Response> {
    const data = await CiudadanoView.obtenerEmergencia(
      routeParam(req.params.uuid),
      req.authCiudadanoId!,
    );
    if (data.isFailure) return this.fail(res, data.error);
    const detalle = data.getValue();
    if (!detalle)
      return res.status(404).json({ error: "Emergencia no encontrada" });
    return res.json(detalle);
  }

  async completarTriage(req: Request, res: Response): Promise<Response> {
    const uuid = routeParam(req.params.uuid);
    const result = await CiudadanoView.completarTriage(
      uuid,
      req.authCiudadanoId!,
      req.body,
    );
    if (result.isFailure) return this.fallo(res, result);

    const detalle = await CiudadanoView.obtenerEmergencia(
      uuid,
      req.authCiudadanoId!,
    );
    if (detalle.isFailure) return this.fail(res, detalle.error);
    return res.status(200).json(detalle.getValue());
  }

  async registrarEvidencia(req: Request, res: Response): Promise<Response> {
    const result = await CiudadanoView.registrarEvidencia(
      routeParam(req.params.uuid),
      req.authCiudadanoId!,
      req.body,
    );
    if (result.isFailure) return this.fallo(res, result);
    const evidencia = result.getValue();
    if (!evidencia)
      return res.status(404).json({ error: "Emergencia no encontrada" });
    return res.status(201).json(evidencia);
  }
}
