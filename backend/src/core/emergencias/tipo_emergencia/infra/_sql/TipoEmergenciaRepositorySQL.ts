import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { TipoEmergenciaEntity } from "../../TipoEmergenciaEntity";
import { ITipoEmergenciaRepository } from "../ITipoEmergenciaRepository";

export class TipoEmergenciaRepositorySQL extends BaseSQLRepository<TipoEmergenciaEntity, Record<string, unknown>> implements ITipoEmergenciaRepository {
  fromSQLModelData(data: Record<string, unknown>, id: string): Result<TipoEmergenciaEntity> { return TipoEmergenciaEntity.create(data, id); }
  toSQLModelData(entity: TipoEmergenciaEntity): Record<string, unknown> { return entity.props; }
}
