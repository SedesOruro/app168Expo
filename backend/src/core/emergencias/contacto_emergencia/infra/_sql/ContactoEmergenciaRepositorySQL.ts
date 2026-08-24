import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { ContactoEmergenciaEntity } from "../../ContactoEmergenciaEntity";
import { IContactoEmergenciaRepository } from "../IContactoEmergenciaRepository";

export class ContactoEmergenciaRepositorySQL extends BaseSQLRepository<ContactoEmergenciaEntity, Record<string, unknown>> implements IContactoEmergenciaRepository {
  fromSQLModelData(data: Record<string, unknown>, id: string): Result<ContactoEmergenciaEntity> { return ContactoEmergenciaEntity.create(data, id); }
  toSQLModelData(entity: ContactoEmergenciaEntity): Record<string, unknown> { return entity.props; }
}
