import { BaseService } from "../base/BaseService";
import { BaseResponse, QueryParams } from "../../types/api";

export type DashboardStats = {
  emergencies: number;
  active: number;
  citizens: number;
  centers: number;
};

export type EmergencyRow = {
  id: number;
  uuid: string;
  codigo_publico: string;
  gravedad: string;
  created_at: string;
  tipo?: { nombre: string };
  estado?: { id: number; codigo: string; nombre: string; es_final: boolean };
  ciudadano?: {
    email: string;
    telefono: string;
    perfil?: { nombres: string; apellidos: string; cedula_identidad: string };
    contactos?: Array<{ nombre_completo: string; telefono: string }>;
  };
  operador?: { id: string; fullname: string; celular: string } | null;
  historial?: Array<{ id: number; observacion?: string; created_at: string; estadoNuevo?: { nombre: string } }>;
  triage?: Array<{ id: number; pregunta_texto: string; respuesta_texto: string }>;
  evidencias?: Array<{ id: number; tipo: string; contenido?: string; archivo_url?: string }>;
};

export type CitizenRow = {
  id: number;
  uuid: string;
  email: string;
  telefono: string;
  estado: string;
  created_at: string;
  perfil?: { nombres: string; apellidos: string; cedula_identidad: string };
};

export type HealthCenterRow = {
  id: number;
  uuid: string;
  codigo_rues: string;
  nombre: string;
  departamento: string;
  red_salud: string;
  municipio: string;
  localidad?: string;
  direccion?: string;
  nivel?: string;
  tipo?: string;
  latitud?: number | string | null;
  longitud?: number | string | null;
  activo: boolean;
};

export type HealthCenterForm = Omit<HealthCenterRow, "id" | "uuid"> & { uuid?: string };

export const OperationsService = {
  dashboard: (): Promise<BaseResponse<DashboardStats>> =>
    BaseService.request("get", "/operations/dashboard"),
  emergencies: (params?: QueryParams): Promise<BaseResponse<EmergencyRow>> =>
    BaseService.findAll("/operations/emergencies", params),
  emergency: (uuid: string): Promise<BaseResponse<EmergencyRow>> =>
    BaseService.request("get", `/operations/emergencies/${uuid}`),
  updateEmergency: (
    uuid: string,
    payload: { statusCode?: string; operatorId?: string | null; observation?: string },
  ): Promise<BaseResponse<{ updated: boolean }>> =>
    BaseService.request("patch", `/operations/emergencies/${uuid}`, payload),
  statuses: (): Promise<BaseResponse<Array<{ id: number; codigo: string; nombre: string }>>> =>
    BaseService.request("get", "/operations/statuses"),
  operators: (): Promise<BaseResponse<Array<{ id: string; fullname: string; nombre: string; celular: string }>>> =>
    BaseService.request("get", "/operations/operators"),
  citizens: (params?: QueryParams): Promise<BaseResponse<CitizenRow>> =>
    BaseService.findAll("/operations/citizens", params),
  updateCitizenStatus: (uuid: string, active: boolean): Promise<BaseResponse<unknown>> =>
    BaseService.request("patch", `/operations/citizens/${uuid}/status`, { active }),
  resetCitizenPassword: (uuid: string): Promise<BaseResponse<unknown>> =>
    BaseService.request("patch", `/operations/citizens/${uuid}/password`),
  healthCenters: (params?: QueryParams): Promise<BaseResponse<HealthCenterRow>> =>
    BaseService.findAll("/operations/health-centers", params),
  createHealthCenter: (payload: HealthCenterForm): Promise<BaseResponse<HealthCenterRow>> =>
    BaseService.request("post", "/operations/health-centers", payload),
  updateHealthCenter: (uuid: string, payload: HealthCenterForm): Promise<BaseResponse<HealthCenterRow>> =>
    BaseService.request("put", `/operations/health-centers/${uuid}`, payload),
  deactivateHealthCenter: (uuid: string): Promise<BaseResponse<unknown>> =>
    BaseService.request("delete", `/operations/health-centers/${uuid}`),
};
