import { BaseService } from "../../../services/base/BaseService";
import { BaseResponse, QueryParams } from "../../../types/api";

export type RolTablaModelo = {
  id: string;
  nombre: string;
  tipo: string;
  permisos: string;
  modulos: Array<{ id?: string; name?: string; title?: string; path?: string }>;
  actions?: string;
};

export type RolFormularioModelo = {
  id?: string;
  nombre: string;
  tipo?: string;
  permisos: string[];
  modulos: Array<{ id?: string; name?: string; title?: string; path?: string }>;
};

export type RolOpcion = {
  id: string;
  nombre: string;
};

const obtenerTablaRoles = async (queryParams?: QueryParams): Promise<BaseResponse<RolTablaModelo>> => {
  return BaseService.findAll<RolTablaModelo>("/roles/roles_tabla", queryParams);
};

const crearRol = async (data: RolFormularioModelo): Promise<BaseResponse<unknown>> => {
  return BaseService.request("post", "/roles/rol_formulario", data);
};

const actualizarRol = async (data: RolFormularioModelo): Promise<BaseResponse<unknown>> => {
  return BaseService.request("post", "/roles/rol_formulario", data);
};

const obtenerDatosFormularioRol = async (id: string): Promise<BaseResponse<RolFormularioModelo>> => {
  return BaseService.request("get", `/roles/rol_formulario/${id}`);
};

const eliminarRol = async (id: string): Promise<BaseResponse<unknown>> => {
  return BaseService.request("delete", `/roles/roles_tabla/${id}`);
};

const obtenerTodosRoles = async (queryParams?: QueryParams): Promise<BaseResponse<RolOpcion>> => {
  return BaseService.findAll<RolOpcion>("/roles/roles", queryParams);
};

export const RolesModuloServicio = {
  obtenerTablaRoles,
  crearRol,
  actualizarRol,
  obtenerDatosFormularioRol,
  eliminarRol,
  obtenerTodosRoles
};
