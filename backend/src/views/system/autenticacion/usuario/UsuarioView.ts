import { Result } from "../../../../base/types/Result";
import RolService from "../../../../core/system/autenticacion/rol";
import { Permiso } from "../../../../core/system/autenticacion/rol/RolEntity";
import UsuarioService from "../../../../core/system/autenticacion/usuario";
import { UsuarioEntity } from "../../../../core/system/autenticacion/usuario/UsuarioEntity";
import { UsuarioAutenticado } from "../../../../utils/jwt";
import { findAndCountResult } from "../../../../utils/findAndCountResult";

export type SessionInfoResponse = {
  id_usuario: string;
  nombre: string;
  avatar: string;
  username: string;
  genero: string;
  permisos: Permiso;
  rol: string;
  celular?: string;
  modulos: unknown[];
};

type UsuarioTablaItem = {
  id: string;
  activo: boolean;
  nombre: string;
  email: string;
  rol: string;
  is_jefe: boolean;
  estado: string;
};

export type ObtenerTablaUsuariosRespuesta = {
  rows: UsuarioTablaItem[];
  count: number;
};

export type ObtenerDatosFormularioUsuarioRespuesta = {
  id: string;
  username: string;
  email: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  direccion: string;
  rol_id: string;
  ci: string;
  telefono: string;
  genero: string;
  is_jefe: string;
};

const mapUsuarioFormulario = (
  user: UsuarioEntity,
): ObtenerDatosFormularioUsuarioRespuesta => ({
  id: user.id,
  username: user.props.username,
  email: user.props.email,
  rol_id: user.props.rolId,
  ci: user.props.ci,
  nombre: user.props.nombre,
  primer_apellido: user.props.primerApellido,
  segundo_apellido: user.props.segundoApellido,
  direccion: user.props.direccion,
  telefono: user.props.celular,
  genero: user.props.genero,
  is_jefe: user.props.isJefe ? "1" : "0",
});

export class UsuarioView {
  async validateLogin(
    email: string,
    password: string,
  ): Promise<Result<UsuarioEntity>> {
    return UsuarioService.validateLogin(email, password);
  }

  async getSessionInfo(
    userInfo: UsuarioAutenticado,
  ): Promise<Result<SessionInfoResponse>> {
    const usuario = await UsuarioService.getById(userInfo.uid);
    if (usuario.isFailure)
      return Result.fail<SessionInfoResponse>("Usuario no encontrado");

    const user = usuario.getValue();
    const rol = await RolService.getById(user.props.rolId);
    if (rol.isFailure)
      return Result.fail<SessionInfoResponse>("Rol no encontrado");
    const rolValue = rol.getValue();

    return Result.ok({
      id_usuario: user.id,
      avatar: user.props.avatar || "",
      username: user.props.username,
      nombre: user.getNombreCompleto(),
      genero: user.props.genero,
      permisos: rolValue.getPermisos(),
      rol: rolValue.props.tipo,
      celular: user.props.celular,
      modulos: rolValue.props.modulos || [],
    });
  }

  async obtenerTablaUsuarios(
    query: any,
  ): Promise<Result<ObtenerTablaUsuariosRespuesta>> {
    const usuarios = await UsuarioService.getAll();
    if (usuarios.isFailure)
      return Result.fail<ObtenerTablaUsuariosRespuesta>(
        usuarios.error || "Fallo al obtener usuarios",
      );
    const roles = await RolService.getAll();
    if (roles.isFailure)
      return Result.fail<ObtenerTablaUsuariosRespuesta>(
        roles.error || "Fallo al obtener roles",
      );

    const rows = usuarios.getValue().map((user) => {
      const rol = roles.getValue().find((item) => item.id === user.props.rolId);
      return {
        id: user.id,
        activo: user.props.activo,
        nombre: user.getNombreCompletoCI(),
        email: user.props.email,
        rol: rol?.props.nombre || "",
        is_jefe: user.props.isJefe || false,
        estado: user.props.estado,
      };
    });

    return Result.ok(findAndCountResult(rows, query));
  }

  async obtenerDatosFormularioUsuarioView(
    id: string,
  ): Promise<Result<ObtenerDatosFormularioUsuarioRespuesta>> {
    const usuario = await UsuarioService.getById(id);
    if (usuario.isFailure)
      return Result.fail<ObtenerDatosFormularioUsuarioRespuesta>(
        "Usuario no encontrado",
      );
    return Result.ok(mapUsuarioFormulario(usuario.getValue()));
  }

  async obtenerTodosUsuarios(): Promise<
    Result<{ rows: Array<{ id: string; nombre: string }>; count: number }>
  > {
    const usuarios = await UsuarioService.getAll();
    if (usuarios.isFailure) return Result.fail("Fallo al obtener usuarios");
    const rows = usuarios
      .getValue()
      .filter((user) => user.props.activo)
      .map((item) => ({ id: item.id, nombre: item.getNombreCompleto() }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
    return Result.ok({ rows, count: rows.length });
  }
}
