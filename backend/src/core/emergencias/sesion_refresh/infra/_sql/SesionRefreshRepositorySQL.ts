import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { SesionRefreshEntity } from "../../SesionRefreshEntity";
import { ISesionRefreshRepository } from "../ISesionRefreshRepository";

export class SesionRefreshRepositorySQL extends BaseSQLRepository<SesionRefreshEntity, Record<string, unknown>> implements ISesionRefreshRepository {
  fromSQLModelData(data: Record<string, unknown>, id: string): Result<SesionRefreshEntity> { return SesionRefreshEntity.create(data, id); }
  toSQLModelData(entity: SesionRefreshEntity): Record<string, unknown> { return entity.props; }
}
