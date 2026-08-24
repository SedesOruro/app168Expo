import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { EvidenciaEmergenciaEntity } from "../../EvidenciaEmergenciaEntity";
import { IEvidenciaEmergenciaRepository } from "../IEvidenciaEmergenciaRepository";

export class EvidenciaEmergenciaRepositorySQL extends BaseSQLRepository<EvidenciaEmergenciaEntity, Record<string, unknown>> implements IEvidenciaEmergenciaRepository {
  fromSQLModelData(data: Record<string, unknown>, id: string): Result<EvidenciaEmergenciaEntity> { return EvidenciaEmergenciaEntity.create(data, id); }
  toSQLModelData(entity: EvidenciaEmergenciaEntity): Record<string, unknown> { return entity.props; }
}
