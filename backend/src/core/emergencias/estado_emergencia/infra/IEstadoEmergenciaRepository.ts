import { IRepository } from "../../../../base/infra/IRepository";
import { Result } from "../../../../base/types/Result";
import { EstadoEmergenciaEntity } from "../EstadoEmergenciaEntity";

export type EstadoCatalogo = Record<string, unknown>;

export type EstadoResumen = {
  id: number;
  codigo: string;
  esFinal: boolean;
};

export interface IEstadoEmergenciaRepository
  extends IRepository<EstadoEmergenciaEntity> {
  listarActivos(): Promise<Result<EstadoCatalogo[]>>;
  buscarPorCodigoActivo(codigo: string): Promise<Result<EstadoResumen | null>>;
}
