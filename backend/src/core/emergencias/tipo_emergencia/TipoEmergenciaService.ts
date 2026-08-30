import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import {
  TipoEmergenciaEntity,
  TipoEmergenciaProps,
} from "./TipoEmergenciaEntity";
import {
  ITipoEmergenciaRepository,
  TipoCatalogo,
  TipoResumen,
} from "./infra/ITipoEmergenciaRepository";

export class TipoEmergenciaService extends BaseService<
  TipoEmergenciaEntity,
  TipoEmergenciaProps
> {
  public constructor(protected readonly repo: ITipoEmergenciaRepository) {
    super(repo);
  }

  factory(
    props: TipoEmergenciaProps,
    id?: string,
  ): Promise<Result<TipoEmergenciaEntity>> {
    return Promise.resolve(TipoEmergenciaEntity.create(props, id));
  }

  listarActivos(): Promise<Result<TipoCatalogo[]>> {
    return this.repo.listarActivos();
  }

  buscarPorCodigoActivo(codigo: string): Promise<Result<TipoResumen | null>> {
    return this.repo.buscarPorCodigoActivo(codigo);
  }
}
