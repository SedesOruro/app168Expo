import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import { HistorialEmergenciaEntity, HistorialEmergenciaProps } from "./HistorialEmergenciaEntity";
import { IHistorialEmergenciaRepository } from "./infra/IHistorialEmergenciaRepository";

export class HistorialEmergenciaService extends BaseService<HistorialEmergenciaEntity, HistorialEmergenciaProps> {
  public constructor(repo: IHistorialEmergenciaRepository) { super(repo); }
  factory(props: HistorialEmergenciaProps, id?: string): Promise<Result<HistorialEmergenciaEntity>> {
    return Promise.resolve(HistorialEmergenciaEntity.create(props, id));
  }
}
