import { Op } from "sequelize";
import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { Database } from "../../../../../config/database";
import { SesionRefreshEntity } from "../../SesionRefreshEntity";
import {
  CuentaDeSesion,
  DatosSesion,
  ISesionRefreshRepository,
} from "../ISesionRefreshRepository";

const db = () => Database.getInstance();

export class SesionRefreshRepositorySQL
  extends BaseSQLRepository<SesionRefreshEntity, Record<string, unknown>>
  implements ISesionRefreshRepository
{
  fromSQLModelData(
    data: Record<string, unknown>,
    id: string,
  ): Result<SesionRefreshEntity> {
    return SesionRefreshEntity.create(data, id);
  }

  toSQLModelData(entity: SesionRefreshEntity): Record<string, unknown> {
    return entity.props;
  }

  async crear(datos: DatosSesion): Promise<Result<boolean>> {
    await this.model.create({
      usuario_id: datos.ciudadanoId,
      jti: datos.jti,
      token_hash: datos.tokenHash,
      dispositivo: datos.dispositivo,
      ip_origen: datos.ipOrigen,
      expira_at: datos.expiraAt,
    });
    return Result.ok(true);
  }

  async rotar(
    hashActual: string,
    nueva: Omit<DatosSesion, "ciudadanoId">,
  ): Promise<Result<CuentaDeSesion | null>> {
    const transaction = await db().sequelize.transaction();
    try {
      const sesion = await this.model.findOne({
        where: {
          token_hash: hashActual,
          revocado_at: null,
          expira_at: { [Op.gt]: new Date() },
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!sesion) {
        await transaction.rollback();
        return Result.ok(null);
      }

      const ciudadano = await db().models.ciudadano.findByPk(
        sesion.usuario_id,
        { transaction },
      );
      if (!ciudadano || ciudadano.estado !== "ACTIVO") {
        await transaction.rollback();
        return Result.ok(null);
      }

      await this.model.create(
        {
          usuario_id: ciudadano.id,
          jti: nueva.jti,
          token_hash: nueva.tokenHash,
          dispositivo: nueva.dispositivo,
          ip_origen: nueva.ipOrigen,
          expira_at: nueva.expiraAt,
        },
        { transaction },
      );
      await sesion.update(
        { revocado_at: new Date(), reemplazado_por_jti: nueva.jti },
        { transaction },
      );
      await transaction.commit();

      return Result.ok({
        id: Number(ciudadano.id),
        uuid: String(ciudadano.uuid),
        email: String(ciudadano.email),
        estado: String(ciudadano.estado),
      });
    } catch (error) {
      await transaction.rollback();
      return Result.fail<CuentaDeSesion | null>(
        String((error as Error).message),
      );
    }
  }

  async revocarPorHash(hash: string): Promise<Result<boolean>> {
    await this.model.update(
      { revocado_at: new Date() },
      { where: { token_hash: hash, revocado_at: null } },
    );
    return Result.ok(true);
  }
}
