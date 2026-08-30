import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { Database } from "../../../../../config/database";
import { PerfilEntity } from "../../PerfilEntity";
import {
  CambioPerfil,
  IPerfilRepository,
  PerfilCompleto,
} from "../IPerfilRepository";

const db = () => Database.getInstance();

export class PerfilRepositorySQL
  extends BaseSQLRepository<PerfilEntity, Record<string, unknown>>
  implements IPerfilRepository
{
  fromSQLModelData(
    data: Record<string, unknown>,
    id: string,
  ): Result<PerfilEntity> {
    return PerfilEntity.create(data, id);
  }

  toSQLModelData(entity: PerfilEntity): Record<string, unknown> {
    return entity.props;
  }

  async obtenerPerfilCompleto(
    ciudadanoId: number,
  ): Promise<Result<PerfilCompleto | null>> {
    const ciudadano = await db().models.ciudadano.findByPk(ciudadanoId);
    if (!ciudadano) return Result.ok(null);

    const [perfil, contactos] = await Promise.all([
      this.model.findOne({ where: { usuario_id: ciudadano.id } }),
      db().models.contactoEmergencia.findAll({
        where: { usuario_id: ciudadano.id, activo: true },
        order: [["es_principal", "DESC"]],
      }),
    ]);

    return Result.ok({
      cuenta: {
        uuid: String(ciudadano.uuid),
        email: String(ciudadano.email),
        telefono: ciudadano.telefono ?? null,
      },
      perfil,
      contactos,
    });
  }

  async guardarPerfilCompleto(
    ciudadanoId: number,
    cambio: CambioPerfil,
  ): Promise<Result<boolean>> {
    const transaction = await db().sequelize.transaction();
    try {
      const ciudadano = await db().models.ciudadano.findByPk(ciudadanoId, {
        transaction,
      });
      const perfil = await this.model.findOne({
        where: { usuario_id: ciudadanoId },
        transaction,
      });
      if (!ciudadano || !perfil) {
        await transaction.rollback();
        return Result.noEncontrado<boolean>("Perfil no encontrado");
      }

      await perfil.update(cambio.campos, { transaction });

      if (cambio.telefono !== undefined) {
        await ciudadano.update({ telefono: cambio.telefono }, { transaction });
      }

      if (cambio.contacto) {
        const datos = {
          nombre_completo: cambio.contacto.nombre,
          telefono: cambio.contacto.telefono,
          parentesco: cambio.contacto.parentesco,
        };
        const actual = await db().models.contactoEmergencia.findOne({
          where: { usuario_id: ciudadano.id, es_principal: true, activo: true },
          transaction,
        });
        if (actual) await actual.update(datos, { transaction });
        else
          await db().models.contactoEmergencia.create(
            { ...datos, usuario_id: ciudadano.id, es_principal: true, activo: true },
            { transaction },
          );
      }

      await transaction.commit();
      return Result.ok(true);
    } catch (error) {
      await transaction.rollback();
      return Result.fail<boolean>(String((error as Error).message), "INTERNO");
    }
  }
}
