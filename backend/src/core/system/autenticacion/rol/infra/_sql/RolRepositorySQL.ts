import { BaseSQLRepository } from "../../../../../../base/BaseRepository";
import { Result } from "../../../../../../base/Result";
import { RolEntity } from "../../RolEntity";
import { IRolRepository } from "../IRolRepository";
import { RolSQLModelData } from "./RolSQLModel";

export class RolRepositorySQL
  extends BaseSQLRepository<RolEntity, RolSQLModelData>
  implements IRolRepository
{
  protected searchableFields(): string[] {
    return ["nombre", "tipo"];
  }

  fromSQLModelData(data: RolSQLModelData, id: string): Result<RolEntity> {
    return RolEntity.create(
      {
        nombre: data.nombre,
        tipo: data.tipo,
        permisos: data.permisos,
        modulos: data.modulos || [],
      },
      id,
    );
  }

  toSQLModelData(entity: RolEntity): RolSQLModelData {
    return {
      nombre: entity.props.nombre,
      tipo: entity.props.tipo,
      permisos: entity.props.permisos,
      modulos: entity.props.modulos,
    };
  }
}
