import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import { TipoEmergenciaEntity, TipoEmergenciaProps } from "./TipoEmergenciaEntity";
import { ITipoEmergenciaRepository } from "./infra/ITipoEmergenciaRepository";

export class TipoEmergenciaService extends BaseService<TipoEmergenciaEntity, TipoEmergenciaProps> {
  public constructor(repo: ITipoEmergenciaRepository) { super(repo); }
  factory(props: TipoEmergenciaProps, id?: string): Promise<Result<TipoEmergenciaEntity>> {
    return Promise.resolve(TipoEmergenciaEntity.create(props, id));
  }
}
