import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { CentroSaludEntity } from "../../CentroSaludEntity";
import { ICentroSaludRepository } from "../ICentroSaludRepository";
import { CentroSaludSQLModelData } from "./CentroSaludSQLModel";

export class CentroSaludRepositorySQL
  extends BaseSQLRepository<CentroSaludEntity, CentroSaludSQLModelData>
  implements ICentroSaludRepository
{
  protected searchableFields(): string[] {
    return ["codigo_rues", "nombre", "municipio"];
  }

  fromSQLModelData(
    data: CentroSaludSQLModelData,
    id: string,
  ): Result<CentroSaludEntity> {
    return CentroSaludEntity.create(
      {
        uuid: data.uuid,
        codigoRues: data.codigo_rues,
        departamento: data.departamento,
        redSalud: data.red_salud,
        municipio: data.municipio,
        nombre: data.nombre,
        latitud: data.latitud === null ? null : Number(data.latitud),
        longitud: data.longitud === null ? null : Number(data.longitud),
        activo: data.activo,
      },
      id,
    );
  }

  toSQLModelData(entity: CentroSaludEntity): CentroSaludSQLModelData {
    return {
      id: Number(entity.id),
      uuid: entity.props.uuid,
      codigo_rues: entity.props.codigoRues,
      departamento: entity.props.departamento,
      red_salud: entity.props.redSalud,
      municipio: entity.props.municipio,
      nombre: entity.props.nombre,
      latitud: entity.props.latitud,
      longitud: entity.props.longitud,
      activo: entity.props.activo,
    };
  }
}
