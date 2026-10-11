import { IRepository } from "../../../../base/infra/IRepository";
import { Result } from "../../../../base/types/Result";
import { CiudadanoEntity } from "../CiudadanoEntity";

export type CiudadanoConPerfil = Record<string, unknown>;

export type ListadoCiudadanos = {
  rows: CiudadanoConPerfil[];
  count: number;
};

export type CiudadanoListadoQuery = {
  limit: number;
  offset: number;
  q?: string;
};


export type CuentaResumen = {
  id: number;
  uuid: string;
  email: string;
  estado: string;
  nombreCompleto: string;
};

export type DatosRegistro = {
  email: string;
  telefono: string;
  passwordHash: string;
  nombres: string;
  apellidos: string;
  cedulaIdentidad: string;
  complementoCi: string | null;
  fechaNacimiento: string;
  direccion: string;
  contactoNombre: string;
  contactoTelefono: string;
  terminosVersion: string;
};

export type SesionInicial = {
  jti: string;
  tokenHash: string;
  dispositivo: string | null;
  ipOrigen: string | null;
  expiraAt: Date;
};

export type CredencialCiudadano = {
  id: number;
  uuid: string;
  email: string;
  estado: string;
  passwordHash: string;
};

export interface ICiudadanoRepository extends IRepository<CiudadanoEntity> {
  buscarCredencialPorCorreo(
    email: string,
  ): Promise<Result<CredencialCiudadano | null>>;
  existeCorreoOTelefono(
    email: string,
    telefono: string,
  ): Promise<Result<boolean>>;
  existeDocumento(
    cedula: string,
    complemento: string | null,
  ): Promise<Result<boolean>>;
  /** Cuenta, perfil, contacto principal y sesion inicial en una transaccion. */
  registrarCuenta(
    datos: DatosRegistro,
    sesion: SesionInicial,
  ): Promise<Result<CuentaResumen>>;
  actualizarUltimoAcceso(id: number): Promise<Result<boolean>>;
  obtenerResumen(id: number): Promise<Result<CuentaResumen | null>>;
  buscarActivoPorUuid(
    uuid: string,
  ): Promise<Result<{ id: number; uuid: string } | null>>;
  contarActivos(): Promise<Result<number>>;
  listarConPerfil(
    query: CiudadanoListadoQuery,
  ): Promise<Result<ListadoCiudadanos>>;
  cambiarEstadoPorUuid(
    uuid: string,
    estado: "ACTIVO" | "INACTIVO",
  ): Promise<Result<boolean>>;
  /** Cedula registrada en el perfil del ciudadano, o null si no tiene perfil. */
  buscarCedulaPorUuid(uuid: string): Promise<Result<string | null>>;
  actualizarPasswordPorUuid(
    uuid: string,
    passwordHash: string,
  ): Promise<Result<boolean>>;
}
