import crypto from "crypto";
import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { Database } from "../../../../../config/database";
import { EvidenciaEmergenciaEntity } from "../../EvidenciaEmergenciaEntity";
import {
  IEvidenciaEmergenciaRepository,
  NuevaEvidencia,
} from "../IEvidenciaEmergenciaRepository";

const db = () => Database.getInstance();

export class EvidenciaEmergenciaRepositorySQL
  extends BaseSQLRepository<EvidenciaEmergenciaEntity, Record<string, unknown>>
  implements IEvidenciaEmergenciaRepository
{
  fromSQLModelData(
    data: Record<string, unknown>,
    id: string,
  ): Result<EvidenciaEmergenciaEntity> {
    return EvidenciaEmergenciaEntity.create(data, id);
  }

  toSQLModelData(entity: EvidenciaEmergenciaEntity): Record<string, unknown> {
    return entity.props;
  }

  async registrarParaCiudadano(
    datos: NuevaEvidencia,
  ): Promise<Result<Record<string, unknown> | null>> {
    const emergencia = await db().models.emergencia.findOne({
      where: { uuid: datos.emergenciaUuid, usuario_id: datos.ciudadanoId },
    });
    if (!emergencia) return Result.ok(null);

    const evidencia = await this.model.create({
      uuid: crypto.randomUUID(),
      emergencia_id: emergencia.id,
      tipo: datos.tipo,
      contenido: datos.contenido ?? null,
      archivo_url: datos.archivoUrl ?? null,
      mime_type: datos.mimeType ?? null,
      duracion_segundos: datos.duracionSegundos ?? null,
    });
    return Result.ok(evidencia);
  }
}
