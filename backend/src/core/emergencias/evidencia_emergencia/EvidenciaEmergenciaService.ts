import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import { EvidenciaEmergenciaEntity, EvidenciaEmergenciaProps } from "./EvidenciaEmergenciaEntity";
import { IEvidenciaEmergenciaRepository } from "./infra/IEvidenciaEmergenciaRepository";

export class EvidenciaEmergenciaService extends BaseService<EvidenciaEmergenciaEntity, EvidenciaEmergenciaProps> {
  public constructor(repo: IEvidenciaEmergenciaRepository) { super(repo); }
  factory(props: EvidenciaEmergenciaProps, id?: string): Promise<Result<EvidenciaEmergenciaEntity>> {
    return Promise.resolve(EvidenciaEmergenciaEntity.create(props, id));
  }
}
