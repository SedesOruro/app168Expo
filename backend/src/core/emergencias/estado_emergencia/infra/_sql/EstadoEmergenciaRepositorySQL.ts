import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { EstadoEmergenciaEntity } from "../../EstadoEmergenciaEntity";
import {
  EstadoCatalogo,
  EstadoResumen,
  IEstadoEmergenciaRepository,
} from "../IEstadoEmergenciaRepository";

export class EstadoEmergenciaRepositorySQL
  extends BaseSQLRepository<EstadoEmergenciaEntity, Record<string, unknown>>
  implements IEstadoEmergenciaRepository
{
  fromSQLModelData(
    data: Record<string, unknown>,
    id: string,
  ): Result<EstadoEmergenciaEntity> {
    return EstadoEmergenciaEntity.create(data, id);
  }

  toSQLModelData(entity: EstadoEmergenciaEntity): Record<string, unknown> {
    return entity.props;
  }

  async listarActivos(): Promise<Result<EstadoCatalogo[]>> {
    const filas = await this.model.findAll({
      where: { activo: true },
      order: [["orden", "ASC"]],
    });
    return Result.ok(filas);
  }

  async buscarPorCodigoActivo(
    codigo: string,
  ): Promise<Result<EstadoResumen | null>> {
    const fila = await this.model.findOne({
      where: { codigo: codigo.toUpperCase(), activo: true },
    });
    if (!fila) return Result.ok(null);
    return Result.ok({
      id: Number(fila.id),
      codigo: String(fila.codigo),
      esFinal: Boolean(fila.es_final),
    });
  }
}
