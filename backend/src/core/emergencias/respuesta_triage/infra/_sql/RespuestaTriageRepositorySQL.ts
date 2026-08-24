import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { RespuestaTriageEntity } from "../../RespuestaTriageEntity";
import { IRespuestaTriageRepository } from "../IRespuestaTriageRepository";

export class RespuestaTriageRepositorySQL extends BaseSQLRepository<RespuestaTriageEntity, Record<string, unknown>> implements IRespuestaTriageRepository {
  fromSQLModelData(data: Record<string, unknown>, id: string): Result<RespuestaTriageEntity> { return RespuestaTriageEntity.create(data, id); }
  toSQLModelData(entity: RespuestaTriageEntity): Record<string, unknown> { return entity.props; }
}
