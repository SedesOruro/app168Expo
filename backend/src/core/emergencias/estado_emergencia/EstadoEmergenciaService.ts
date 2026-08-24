import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import { EstadoEmergenciaEntity, EstadoEmergenciaProps } from "./EstadoEmergenciaEntity";
import { IEstadoEmergenciaRepository } from "./infra/IEstadoEmergenciaRepository";

export class EstadoEmergenciaService extends BaseService<EstadoEmergenciaEntity, EstadoEmergenciaProps> {
  public constructor(repo: IEstadoEmergenciaRepository) { super(repo); }
  factory(props: EstadoEmergenciaProps, id?: string): Promise<Result<EstadoEmergenciaEntity>> {
    return Promise.resolve(EstadoEmergenciaEntity.create(props, id));
  }
}
