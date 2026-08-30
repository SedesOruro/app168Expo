import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { TipoEmergenciaEntity } from "../../TipoEmergenciaEntity";
import {
  ITipoEmergenciaRepository,
  TipoCatalogo,
  TipoResumen,
} from "../ITipoEmergenciaRepository";

export class TipoEmergenciaRepositorySQL
  extends BaseSQLRepository<TipoEmergenciaEntity, Record<string, unknown>>
  implements ITipoEmergenciaRepository
{
  fromSQLModelData(
    data: Record<string, unknown>,
    id: string,
  ): Result<TipoEmergenciaEntity> {
    return TipoEmergenciaEntity.create(data, id);
  }

  toSQLModelData(entity: TipoEmergenciaEntity): Record<string, unknown> {
    return entity.props;
  }

  async listarActivos(): Promise<Result<TipoCatalogo[]>> {
    const filas = await this.model.findAll({
      where: { activo: true },
      order: [["orden", "ASC"]],
    });
    return Result.ok(filas);
  }

  async buscarPorCodigoActivo(
    codigo: string,
  ): Promise<Result<TipoResumen | null>> {
    const fila = await this.model.findOne({
      where: { codigo: codigo.toUpperCase(), activo: true },
    });
    if (!fila) return Result.ok(null);
    return Result.ok({ id: Number(fila.id), codigo: String(fila.codigo) });
  }
}
