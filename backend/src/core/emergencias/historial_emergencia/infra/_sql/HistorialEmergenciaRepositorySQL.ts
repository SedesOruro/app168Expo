import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { HistorialEmergenciaEntity } from "../../HistorialEmergenciaEntity";
import { IHistorialEmergenciaRepository } from "../IHistorialEmergenciaRepository";

export class HistorialEmergenciaRepositorySQL extends BaseSQLRepository<HistorialEmergenciaEntity, Record<string, unknown>> implements IHistorialEmergenciaRepository {
  fromSQLModelData(data: Record<string, unknown>, id: string): Result<HistorialEmergenciaEntity> { return HistorialEmergenciaEntity.create(data, id); }
  toSQLModelData(entity: HistorialEmergenciaEntity): Record<string, unknown> { return entity.props; }
}
