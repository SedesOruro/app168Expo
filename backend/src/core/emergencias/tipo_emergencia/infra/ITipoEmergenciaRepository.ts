import { IRepository } from "../../../../base/infra/IRepository";
import { Result } from "../../../../base/types/Result";
import { TipoEmergenciaEntity } from "../TipoEmergenciaEntity";

export type TipoCatalogo = Record<string, unknown>;

export type TipoResumen = { id: number; codigo: string };

export interface ITipoEmergenciaRepository
  extends IRepository<TipoEmergenciaEntity> {
  listarActivos(): Promise<Result<TipoCatalogo[]>>;
  buscarPorCodigoActivo(codigo: string): Promise<Result<TipoResumen | null>>;
}
