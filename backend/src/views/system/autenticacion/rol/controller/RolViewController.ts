import { Request, Response } from "express";
import { BaseHttpController } from "../../../../../base/infra/BaseHttpController";
import RolService from "../../../../../core/system/autenticacion/rol";
import { RolProps } from "../../../../../core/system/autenticacion/rol/RolEntity";
import RolView from "..";
import { routeParam } from "../../../../../utils/routeParam";

export class RolViewController extends BaseHttpController {
  async obtenerTablaRoles(req: Request, res: Response): Promise<Response> {
    const data = await RolView.obtenerTablaRoles(req.query);
    if (data.isFailure) return this.fail(res, data.error);
    return this.ok(res, data.getValue());
  }

  async obtenerDatosFormularioRol(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const data = await RolView.obtenerDatosFormularioRolView(
      routeParam(req.params.rol_id),
    );
    if (data.isFailure) return this.fail(res, data.error);
    return this.ok(res, data.getValue());
  }

  async obtenerTodosRoles(_req: Request, res: Response): Promise<Response> {
    const data = await RolView.obtenerTodosRoles();
    if (data.isFailure) return this.fail(res, data.error);
    return this.ok(res, data.getValue());
  }

  async crearOActualizarRol(req: Request, res: Response): Promise<Response> {
    const data = req.body as {
      id?: string;
      nombre: string;
      tipo?: string;
      permisos?: string[] | Record<string, boolean>;
      modulos?: unknown[];
    };

    const permisosObject = Array.isArray(data.permisos)
      ? data.permisos.reduce(
          (acc, permiso) => ({ ...acc, [permiso]: true }),
          {},
        )
      : data.permisos || {};

    const props: RolProps = {
      nombre: data.nombre,
      tipo: data.tipo || "",
      permisos: JSON.stringify(permisosObject),
      modulos: (data.modulos || []) as any[],
    };

    const result = data.id
      ? await RolService.update(data.id, props)
      : await RolService.create(props);
    if (result.isFailure) return this.fail(res, result.error);
    const rol = result.getValue();
    return this.ok(res, { id: rol.id, ...rol.props });
  }

  async eliminarRol(req: Request, res: Response): Promise<Response> {
    const result = await RolService.delete(routeParam(req.params.rol_id));
    if (result.isFailure) return this.fail(res, result.error);
    return this.ok(res, { deleted: true });
  }
}
