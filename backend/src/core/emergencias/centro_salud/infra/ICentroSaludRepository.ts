import { IRepository } from "../../../../base/infra/IRepository";
import { Result } from "../../../../base/types/Result";
import { CentroSaludEntity } from "../CentroSaludEntity";

export type CentroSaludFila = Record<string, unknown>;

export type ListadoCentros = {
  rows: CentroSaludFila[];
  count: number;
};

export type CentroSaludListadoQuery = {
  limit: number;
  offset: number;
  q?: string;
  sort?: string;
  order?: "ASC" | "DESC";
};

export type CentroCercanoQuery = {
  q?: string;
  latitud?: number | null;
  longitud?: number | null;
  limit: number;
};

export interface ICentroSaludRepository
  extends IRepository<CentroSaludEntity> {
  contarActivos(): Promise<Result<number>>;
  listarPaginado(
    query: CentroSaludListadoQuery,
  ): Promise<Result<ListadoCentros>>;
  buscarCercanos(query: CentroCercanoQuery): Promise<Result<CentroSaludFila[]>>;
  crear(datos: Record<string, unknown>): Promise<Result<CentroSaludFila>>;
  actualizarPorUuid(
    uuid: string,
    cambios: Record<string, unknown>,
  ): Promise<Result<CentroSaludFila | null>>;
  desactivarPorUuid(uuid: string): Promise<Result<boolean>>;
}
