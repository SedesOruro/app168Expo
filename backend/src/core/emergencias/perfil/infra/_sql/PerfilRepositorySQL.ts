import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { PerfilEntity } from "../../PerfilEntity";
import { IPerfilRepository } from "../IPerfilRepository";

export class PerfilRepositorySQL extends BaseSQLRepository<PerfilEntity, Record<string, unknown>> implements IPerfilRepository {
  fromSQLModelData(data: Record<string, unknown>, id: string): Result<PerfilEntity> { return PerfilEntity.create(data, id); }
  toSQLModelData(entity: PerfilEntity): Record<string, unknown> { return entity.props; }
}
