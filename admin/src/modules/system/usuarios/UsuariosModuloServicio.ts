import { BaseService } from "../../../services/base/BaseService";
import { BaseResponse, QueryParams } from "../../../types/api";

export type UsuarioTablaModelo = {
  id: string;
  activo: boolean;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  actions?: string;
};

export type UsuarioFormModel = {
  id?: string;
  username?: string;
  password?: string;
  ci: string;
  email: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string;
  direccion?: string;
  telefono: string;
  genero: "MASCULINO" | "FEMENINO" | "NINGUNO";
  rol_id: string;
  estado?: "ACTIVO" | "INACTIVO" | "ELIMINADO";
};

const obtenerTablaUsuarios = async (queryParams?: QueryParams): Promise<BaseResponse<UsuarioTablaModelo>> => {
  return BaseService.findAll<UsuarioTablaModelo>("/usuarios/usuarios_tabla", queryParams);
};

const actualizarEstadoUsuario = async (idUsuario: string, activo: boolean): Promise<BaseResponse<UsuarioFormModel>> => {
  return BaseService.request("post", `/usuarios/usuarios_tabla/${idUsuario}`, { activo });
};

const crearUsuario = async (data: UsuarioFormModel): Promise<BaseResponse<unknown>> => {
  return BaseService.request("post", "/usuarios/usuario_formulario", data);
};

const actualizarUsuario = async (data: UsuarioFormModel): Promise<BaseResponse<unknown>> => {
  return BaseService.request("put", "/usuarios/usuario_formulario", data);
};

const obtenerDatosFormularioUsuario = async (id: string): Promise<BaseResponse<UsuarioFormModel>> => {
  return BaseService.request("get", `/usuarios/usuario_formulario/${id}`);
};

const eliminarUsuario = async (id: string): Promise<BaseResponse<unknown>> => {
  return BaseService.request("delete", `/usuarios/usuarios_tabla/${id}`);
};

const obtenerTodosUsuarios = async (queryParams?: QueryParams): Promise<BaseResponse<{ id: string; nombre: string }>> => {
  return BaseService.findAll("/usuarios/usuarios", queryParams);
};

export const UsuariosModuloServicio = {
  obtenerTablaUsuarios,
  actualizarEstadoUsuario,
  crearUsuario,
  actualizarUsuario,
  obtenerDatosFormularioUsuario,
  eliminarUsuario,
  obtenerTodosUsuarios
};
