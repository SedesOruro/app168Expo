import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import { CentroSaludEntity, CentroSaludProps } from "./CentroSaludEntity";
import {
  CentroCercanoQuery,
  CentroSaludFila,
  CentroSaludListadoQuery,
  ICentroSaludRepository,
  ListadoCentros,
} from "./infra/ICentroSaludRepository";

export class CentroSaludService extends BaseService<
  CentroSaludEntity,
  CentroSaludProps
> {
  public constructor(protected readonly repo: ICentroSaludRepository) {
    super(repo);
  }

  factory(
    props: CentroSaludProps,
    id?: string,
  ): Promise<Result<CentroSaludEntity>> {
    return Promise.resolve(CentroSaludEntity.create(props, id));
  }

  contarActivos(): Promise<Result<number>> {
    return this.repo.contarActivos();
  }

  listarPaginado(
    query: CentroSaludListadoQuery,
  ): Promise<Result<ListadoCentros>> {
    return this.repo.listarPaginado(query);
  }

  buscarCercanos(query: CentroCercanoQuery): Promise<Result<CentroSaludFila[]>> {
    return this.repo.buscarCercanos(query);
  }

  crear(datos: Record<string, unknown>): Promise<Result<CentroSaludFila>> {
    return this.repo.crear(datos);
  }

  actualizarPorUuid(
    uuid: string,
    cambios: Record<string, unknown>,
  ): Promise<Result<CentroSaludFila | null>> {
    return this.repo.actualizarPorUuid(uuid, cambios);
  }

  desactivarPorUuid(uuid: string): Promise<Result<boolean>> {
    return this.repo.desactivarPorUuid(uuid);
  }
}
