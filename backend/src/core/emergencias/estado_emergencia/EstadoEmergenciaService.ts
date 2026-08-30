import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import {
  EstadoEmergenciaEntity,
  EstadoEmergenciaProps,
} from "./EstadoEmergenciaEntity";
import {
  EstadoCatalogo,
  EstadoResumen,
  IEstadoEmergenciaRepository,
} from "./infra/IEstadoEmergenciaRepository";

export class EstadoEmergenciaService extends BaseService<
  EstadoEmergenciaEntity,
  EstadoEmergenciaProps
> {
  public constructor(protected readonly repo: IEstadoEmergenciaRepository) {
    super(repo);
  }

  factory(
    props: EstadoEmergenciaProps,
    id?: string,
  ): Promise<Result<EstadoEmergenciaEntity>> {
    return Promise.resolve(EstadoEmergenciaEntity.create(props, id));
  }

  listarActivos(): Promise<Result<EstadoCatalogo[]>> {
    return this.repo.listarActivos();
  }

  buscarPorCodigoActivo(codigo: string): Promise<Result<EstadoResumen | null>> {
    return this.repo.buscarPorCodigoActivo(codigo);
  }
}
