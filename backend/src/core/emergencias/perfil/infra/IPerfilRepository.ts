import { IRepository } from "../../../../base/infra/IRepository";
import { Result } from "../../../../base/types/Result";
import { PerfilEntity } from "../PerfilEntity";

export type CuentaCiudadano = {
  uuid: string;
  email: string;
  telefono: string | null;
};

export type PerfilCompleto = {
  cuenta: CuentaCiudadano;
  perfil: Record<string, unknown> | null;
  contactos: Record<string, unknown>[];
};

export type ContactoPrincipal = {
  nombre: string;
  telefono: string;
  parentesco: string;
};

export type CambioPerfil = {
  campos: Record<string, unknown>;
  telefono?: string;
  contacto?: ContactoPrincipal;
};

export interface IPerfilRepository extends IRepository<PerfilEntity> {
  obtenerPerfilCompleto(
    ciudadanoId: number,
  ): Promise<Result<PerfilCompleto | null>>;
  /** Perfil, telefono de la cuenta y contacto principal en una transaccion. */
  guardarPerfilCompleto(
    ciudadanoId: number,
    cambio: CambioPerfil,
  ): Promise<Result<boolean>>;
}
