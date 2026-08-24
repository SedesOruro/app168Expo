import { Result } from "../../../../base/types/Result";
import RolService from "../../../../core/system/autenticacion/rol";
import { findAndCountResult } from "../../../../utils/findAndCountResult";

type RolTablaItem = {
  id: string;
  nombre: string;
  tipo: string;
  permisos: string;
  modulos: unknown[];
};

export type ObtenerTablaRolesRespuesta = {
  rows: RolTablaItem[];
  count: number;
};

export type ObtenerDatosFormularioRolRespuesta = {
  id: string;
  nombre: string;
  tipo: string;
  permisos: string[];
  modulos: unknown[];
};

export class RolView {
  async obtenerTablaRoles(
    query: any,
  ): Promise<Result<ObtenerTablaRolesRespuesta>> {
    const roles = await RolService.getAll();
    if (roles.isFailure)
      return Result.fail<ObtenerTablaRolesRespuesta>(
        roles.error || "Fallo al obtener roles",
      );

    const rows = roles.getValue().map((item) => ({
      id: item.id,
      nombre: item.props.nombre,
      tipo: item.props.tipo,
      permisos: item.props.permisos,
      modulos: item.props.modulos || [],
    }));

    return Result.ok(findAndCountResult(rows, query));
  }

  async obtenerDatosFormularioRolView(
    id: string,
  ): Promise<Result<ObtenerDatosFormularioRolRespuesta>> {
    const rol = await RolService.getById(id);
    if (rol.isFailure)
      return Result.fail<ObtenerDatosFormularioRolRespuesta>(
        rol.error || "Rol no encontrado",
      );

    const entity = rol.getValue();
    return Result.ok({
      id: entity.id,
      nombre: entity.props.nombre,
      tipo: entity.props.tipo,
      permisos: Object.keys(entity.getPermisos()),
      modulos: entity.props.modulos || [],
    });
  }

  async obtenerTodosRoles(): Promise<
    Result<{ rows: Array<{ id: string; nombre: string }>; count: number }>
  > {
    const roles = await RolService.getAll();
    if (roles.isFailure) return Result.fail("Fallo al obtener roles");
    const rows = roles
      .getValue()
      .map((item) => ({ id: item.id, nombre: item.props.nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
    return Result.ok({ rows, count: rows.length });
  }
}
