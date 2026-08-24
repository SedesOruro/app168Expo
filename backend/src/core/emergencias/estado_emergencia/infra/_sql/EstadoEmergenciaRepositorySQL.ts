import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { EstadoEmergenciaEntity } from "../../EstadoEmergenciaEntity";
import { IEstadoEmergenciaRepository } from "../IEstadoEmergenciaRepository";

export class EstadoEmergenciaRepositorySQL extends BaseSQLRepository<EstadoEmergenciaEntity, Record<string, unknown>> implements IEstadoEmergenciaRepository {
  fromSQLModelData(data: Record<string, unknown>, id: string): Result<EstadoEmergenciaEntity> { return EstadoEmergenciaEntity.create(data, id); }
  toSQLModelData(entity: EstadoEmergenciaEntity): Record<string, unknown> { return entity.props; }
}
