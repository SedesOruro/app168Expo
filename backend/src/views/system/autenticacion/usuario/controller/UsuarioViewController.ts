import { Request, Response } from "express";
import { BaseHttpController } from "../../../../../base/infra/BaseHttpController";
import RolService from "../../../../../core/system/autenticacion/rol";
import UsuarioService from "../../../../../core/system/autenticacion/usuario";
import {
  CreaUsuarioParams,
  EditaUsuarioParams,
} from "../../../../../core/system/autenticacion/usuario/UsuarioService";
import { signToken } from "../../../../../utils/jwt";
import UsuarioView from "..";
import { routeParam } from "../../../../../utils/routeParam";

export class UsuarioViewController extends BaseHttpController {
  async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };
    if (!email || !password)
      return this.fail(res, "email y password son requeridos");

    const usuario = await UsuarioView.validateLogin(email, password);
    if (usuario.isFailure) return this.fail(res, usuario.error);
    const user = usuario.getValue();

    const rol = await RolService.getById(user.props.rolId);
    if (rol.isFailure) return this.fail(res, rol.error);
    const rolValue = rol.getValue();

    const token = signToken({
      uid: user.id,
      email: user.props.email,
      rol: rolValue.props.tipo,
      permisos: rolValue.getPermisos(),
      [rolValue.props.tipo]: true,
    });

    await UsuarioService.adicionarDispositivoALaLista(user.id, { token });
    return this.ok(res, { token });
  }

  async getSessionInfo(req: Request, res: Response): Promise<Response> {
    if (!req.authUser) return this.fail(res, "Acceso no autorizado");
    const data = await UsuarioView.getSessionInfo(req.authUser);
    if (data.isFailure) return this.fail(res, data.error);
    return this.ok(res, data.getValue());
  }

  async obtenerTablaUsuarios(req: Request, res: Response): Promise<Response> {
    const data = await UsuarioView.obtenerTablaUsuarios(req.query);
    if (data.isFailure) return this.fail(res, data.error);
    return this.ok(res, data.getValue());
  }

  async obtenerDatosFormularioUsuario(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const data = await UsuarioView.obtenerDatosFormularioUsuarioView(
      routeParam(req.params.usuario_id),
    );
    if (data.isFailure) return this.fail(res, data.error);
    return this.ok(res, data.getValue());
  }

  async obtenerTodosUsuarios(_req: Request, res: Response): Promise<Response> {
    const data = await UsuarioView.obtenerTodosUsuarios();
    if (data.isFailure) return this.fail(res, data.error);
    return this.ok(res, data.getValue());
  }

  async crearUsuario(req: Request, res: Response): Promise<Response> {
    const data = req.body as any;
    const params: CreaUsuarioParams = {
      email: data.email,
      password: data.password,
      nombre: data.nombre,
      primerApellido: data.primer_apellido,
      segundoApellido: data.segundo_apellido || "",
      ci: data.ci || "",
      direccion: data.direccion || "",
      celular: data.telefono || "",
      genero: data.genero || "NINGUNO",
      rolId: data.rol_id,
      avatar: data.avatar,
    };

    const result = await UsuarioService.creaUsuario(params);
    if (result.isFailure) return this.fail(res, result.error);
    const user = result.getValue();
    return this.ok(res, { id: user.id, ...user.props, password: undefined });
  }

  async actualizarUsuario(req: Request, res: Response): Promise<Response> {
    const data = req.body as any;
    const params: EditaUsuarioParams = {
      id: data.id,
      email: data.email,
      password: data.password,
      nombre: data.nombre,
      primerApellido: data.primer_apellido,
      segundoApellido: data.segundo_apellido,
      ci: data.ci,
      direccion: data.direccion,
      celular: data.telefono,
      genero: data.genero,
      rolId: data.rol_id,
      avatar: data.avatar,
      estado: data.estado,
    };

    const result = await UsuarioService.editaUsuario(params);
    if (result.isFailure) return this.fail(res, result.error);
    const user = result.getValue();
    return this.ok(res, { id: user.id, ...user.props, password: undefined });
  }

  async eliminarUsuario(req: Request, res: Response): Promise<Response> {
    const result = await UsuarioService.delete(
      routeParam(req.params.usuario_id),
    );
    if (result.isFailure) return this.fail(res, result.error);
    return this.ok(res, { deleted: true });
  }

  async changeState(req: Request, res: Response): Promise<Response> {
    const result = await UsuarioService.editaUsuario({
      id: routeParam(req.params.usuario_id),
      estado: req.body.activo ? "ACTIVO" : "INACTIVO",
    });
    if (result.isFailure) return this.fail(res, result.error);
    return this.ok(res, { ok: true });
  }
}
