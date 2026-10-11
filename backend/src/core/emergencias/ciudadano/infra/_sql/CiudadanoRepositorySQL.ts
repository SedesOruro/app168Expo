import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Op } from "sequelize";
import { Result } from "../../../../../base/types/Result";
import { Database } from "../../../../../config/database";
import { CiudadanoEntity } from "../../CiudadanoEntity";
import crypto from "crypto";
import {
  CiudadanoListadoQuery,
  CredencialCiudadano,
  CuentaResumen,
  DatosRegistro,
  ICiudadanoRepository,
  ListadoCiudadanos,
  SesionInicial,
} from "../ICiudadanoRepository";

type CiudadanoSQLModelData = {
  id: number;
  uuid: string;
  email: string;
  telefono?: string | null;
  password_hash: string;
  rol: "CIUDADANO";
  estado: "ACTIVO" | "INACTIVO";
  ultimo_acceso_at?: Date | null;
};

export class CiudadanoRepositorySQL
  extends BaseSQLRepository<CiudadanoEntity, CiudadanoSQLModelData>
  implements ICiudadanoRepository
{
  protected searchableFields(): string[] {
    return ["email", "telefono"];
  }

  fromSQLModelData(
    data: CiudadanoSQLModelData,
    id: string,
  ): Result<CiudadanoEntity> {
    return CiudadanoEntity.create(
      {
        uuid: data.uuid,
        email: data.email,
        telefono: data.telefono,
        passwordHash: data.password_hash,
        rol: "CIUDADANO",
        estado: data.estado,
        ultimoAccesoAt: data.ultimo_acceso_at,
      },
      id,
    );
  }

  toSQLModelData(entity: CiudadanoEntity): CiudadanoSQLModelData {
    return {
      id: Number(entity.id),
      uuid: entity.props.uuid,
      email: entity.props.email,
      telefono: entity.props.telefono,
      password_hash: entity.props.passwordHash,
      rol: entity.props.rol,
      estado: entity.props.estado,
      ultimo_acceso_at: entity.props.ultimoAccesoAt,
    };
  }

  async contarActivos(): Promise<Result<number>> {
    return Result.ok(await this.model.count({ where: { estado: "ACTIVO" } }));
  }

  async listarConPerfil(
    query: CiudadanoListadoQuery,
  ): Promise<Result<ListadoCiudadanos>> {
    const where: Record<string | symbol, unknown> = {};
    const search = String(query.q || "").trim();
    if (search) {
      where[Op.or] = ["email", "telefono"].map((field) => ({
        [field]: { [Op.like]: `%${search}%` },
      }));
    }
    const result = await this.model.findAndCountAll({
      where,
      include: [
        { model: Database.getInstance().models.perfil, as: "perfil" },
      ],
      order: [["created_at", "DESC"]],
      limit: query.limit,
      offset: query.offset,
      distinct: true,
    });
    return Result.ok({ rows: result.rows, count: result.count });
  }

  async cambiarEstadoPorUuid(
    uuid: string,
    estado: "ACTIVO" | "INACTIVO",
  ): Promise<Result<boolean>> {
    const fila = await this.model.findOne({ where: { uuid } });
    if (!fila) return Result.noEncontrado<boolean>("Ciudadano no encontrado");
    await fila.update({ estado });
    return Result.ok(true);
  }

  async buscarCedulaPorUuid(uuid: string): Promise<Result<string | null>> {
    const fila = await this.model.findOne({
      where: { uuid },
      include: [
        {
          model: Database.getInstance().models.perfil,
          as: "perfil",
          attributes: ["cedula_identidad"],
        },
      ],
    });
    if (!fila) return Result.noEncontrado<string | null>("Ciudadano no encontrado");
    const perfil = fila.get("perfil") as { cedula_identidad?: string } | null;
    return Result.ok(perfil?.cedula_identidad ?? null);
  }

  async actualizarPasswordPorUuid(
    uuid: string,
    passwordHash: string,
  ): Promise<Result<boolean>> {
    const fila = await this.model.findOne({ where: { uuid } });
    if (!fila) return Result.noEncontrado<boolean>("Ciudadano no encontrado");
    await fila.update({ password_hash: passwordHash });
    return Result.ok(true);
  }

  // ---- autenticacion ----------------------------------------------------

  async buscarCredencialPorCorreo(
    email: string,
  ): Promise<Result<CredencialCiudadano | null>> {
    const fila = await this.model.findOne({ where: { email } });
    if (!fila) return Result.ok(null);
    return Result.ok({
      id: Number(fila.id),
      uuid: String(fila.uuid),
      email: String(fila.email),
      estado: String(fila.estado),
      passwordHash: String(fila.password_hash),
    });
  }

  async existeCorreoOTelefono(
    email: string,
    telefono: string,
  ): Promise<Result<boolean>> {
    const fila = await this.model.findOne({
      where: { [Op.or]: [{ email }, { telefono }] },
      paranoid: false,
    });
    return Result.ok(Boolean(fila));
  }

  async existeDocumento(
    cedula: string,
    complemento: string | null,
  ): Promise<Result<boolean>> {
    const fila = await Database.getInstance().models.perfil.findOne({
      where: { cedula_identidad: cedula, complemento_ci: complemento },
    });
    return Result.ok(Boolean(fila));
  }

  async registrarCuenta(
    datos: DatosRegistro,
    sesion: SesionInicial,
  ): Promise<Result<CuentaResumen>> {
    const db = Database.getInstance();
    const transaction = await db.sequelize.transaction();
    try {
      const ciudadano = await this.model.create(
        {
          uuid: crypto.randomUUID(),
          email: datos.email,
          telefono: datos.telefono,
          password_hash: datos.passwordHash,
          rol: "CIUDADANO",
          estado: "ACTIVO",
        },
        { transaction },
      );
      await db.models.perfil.create(
        {
          usuario_id: ciudadano.id,
          nombres: datos.nombres,
          apellidos: datos.apellidos,
          cedula_identidad: datos.cedulaIdentidad,
          complemento_ci: datos.complementoCi,
          fecha_nacimiento: datos.fechaNacimiento,
          direccion: datos.direccion,
          terminos_version: datos.terminosVersion,
          terminos_aceptados_at: new Date(),
        },
        { transaction },
      );
      await db.models.contactoEmergencia.create(
        {
          usuario_id: ciudadano.id,
          nombre_completo: datos.contactoNombre,
          parentesco: "CONTACTO",
          telefono: datos.contactoTelefono,
          es_principal: true,
          activo: true,
        },
        { transaction },
      );
      await db.models.sesionRefresh.create(
        {
          usuario_id: ciudadano.id,
          jti: sesion.jti,
          token_hash: sesion.tokenHash,
          dispositivo: sesion.dispositivo,
          ip_origen: sesion.ipOrigen,
          expira_at: sesion.expiraAt,
        },
        { transaction },
      );
      await transaction.commit();
      return Result.ok({
        id: Number(ciudadano.id),
        uuid: String(ciudadano.uuid),
        email: String(ciudadano.email),
        estado: String(ciudadano.estado),
        nombreCompleto: `${datos.nombres} ${datos.apellidos}`.trim(),
      });
    } catch (error) {
      await transaction.rollback();
      return Result.fail<CuentaResumen>(String((error as Error).message));
    }
  }

  async actualizarUltimoAcceso(id: number): Promise<Result<boolean>> {
    await this.model.update(
      { ultimo_acceso_at: new Date() },
      { where: { id } },
    );
    return Result.ok(true);
  }

  async obtenerResumen(id: number): Promise<Result<CuentaResumen | null>> {
    const fila = await this.model.findByPk(id);
    if (!fila) return Result.ok(null);
    const perfil = await Database.getInstance().models.perfil.findOne({
      where: { usuario_id: fila.id },
    });
    const nombre = perfil
      ? `${perfil.nombres} ${perfil.apellidos}`.trim()
      : String(fila.email);
    return Result.ok({
      id: Number(fila.id),
      uuid: String(fila.uuid),
      email: String(fila.email),
      estado: String(fila.estado),
      nombreCompleto: nombre,
    });
  }

  async buscarActivoPorUuid(
    uuid: string,
  ): Promise<Result<{ id: number; uuid: string } | null>> {
    const fila = await this.model.findOne({
      where: { uuid, estado: "ACTIVO" },
    });
    if (!fila) return Result.ok(null);
    return Result.ok({ id: Number(fila.id), uuid: String(fila.uuid) });
  }
}
