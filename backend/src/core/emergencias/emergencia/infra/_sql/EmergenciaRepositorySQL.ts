import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { EmergenciaEntity } from "../../EmergenciaEntity";
import { IEmergenciaRepository } from "../IEmergenciaRepository";
import { EmergenciaSQLModelData } from "./EmergenciaSQLModel";

export class EmergenciaRepositorySQL
  extends BaseSQLRepository<EmergenciaEntity, EmergenciaSQLModelData>
  implements IEmergenciaRepository
{
  protected searchableFields(): string[] {
    return ["codigo_publico", "gravedad", "descripcion"];
  }

  fromSQLModelData(
    data: EmergenciaSQLModelData,
    id: string,
  ): Result<EmergenciaEntity> {
    return EmergenciaEntity.create(
      {
        uuid: data.uuid,
        codigoPublico: data.codigo_publico,
        idempotencyKey: data.idempotency_key,
        ciudadanoId: data.usuario_id,
        tipoEmergenciaId: data.tipo_emergencia_id,
        estadoId: data.estado_id,
        gravedad: data.gravedad,
        puntajeTriage: data.puntaje_triage,
        descripcion: data.descripcion,
        latitud: Number(data.latitud),
        longitud: Number(data.longitud),
        reportadaAt: data.reportada_at,
      },
      id,
    );
  }

  toSQLModelData(entity: EmergenciaEntity): EmergenciaSQLModelData {
    return {
      id: Number(entity.id),
      uuid: entity.props.uuid,
      codigo_publico: entity.props.codigoPublico,
      idempotency_key: entity.props.idempotencyKey,
      usuario_id: entity.props.ciudadanoId,
      tipo_emergencia_id: entity.props.tipoEmergenciaId,
      estado_id: entity.props.estadoId,
      gravedad: entity.props.gravedad,
      puntaje_triage: entity.props.puntajeTriage,
      descripcion: entity.props.descripcion,
      latitud: entity.props.latitud,
      longitud: entity.props.longitud,
      reportada_at: entity.props.reportadaAt,
    };
  }
}
