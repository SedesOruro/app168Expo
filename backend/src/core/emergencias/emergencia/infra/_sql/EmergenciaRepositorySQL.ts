import { Op } from "sequelize";
import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { Database } from "../../../../../config/database";
import { EmergenciaEntity } from "../../EmergenciaEntity";
import {
  CambioOperativo,
  EmergenciaConRelaciones,
  EmergenciaListadoQuery,
  EntradaHistorial,
  EstadoActual,
  IEmergenciaRepository,
  ListadoEmergencias,
  NuevaEmergencia,
} from "../IEmergenciaRepository";
import { EmergenciaSQLModelData } from "./EmergenciaSQLModel";

const db = () => Database.getInstance();

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
        ciudadanoId: Number(data.usuario_id),
        tipoEmergenciaId: Number(data.tipo_emergencia_id),
        estadoId: Number(data.estado_id),
        centroSaludSugeridoId: data.centro_salud_sugerido_id ?? null,
        operadorId: data.operador_id ?? null,
        gravedad: data.gravedad,
        puntajeTriage: Number(data.puntaje_triage),
        descripcion: data.descripcion,
        cantidadAfectados: Number(data.cantidad_afectados ?? 1),
        latitud: Number(data.latitud),
        longitud: Number(data.longitud),
        precisionMetros:
          data.precision_metros === null || data.precision_metros === undefined
            ? null
            : Number(data.precision_metros),
        direccionReferencia: data.direccion_referencia,
        ubicacionConfirmada: Boolean(data.ubicacion_confirmada),
        puedeHablar: Boolean(data.puede_hablar),
        metadata: data.metadata ?? null,
        reportadaAt: data.reportada_at,
        finalizadaAt: data.finalizada_at ?? null,
      },
      id,
    );
  }

  toSQLModelData(entity: EmergenciaEntity): EmergenciaSQLModelData {
    const p = entity.props;
    return {
      id: Number(entity.id),
      uuid: p.uuid,
      codigo_publico: p.codigoPublico,
      idempotency_key: p.idempotencyKey,
      usuario_id: p.ciudadanoId,
      tipo_emergencia_id: p.tipoEmergenciaId,
      estado_id: p.estadoId,
      centro_salud_sugerido_id: p.centroSaludSugeridoId ?? null,
      operador_id: p.operadorId ?? null,
      gravedad: p.gravedad,
      puntaje_triage: p.puntajeTriage,
      descripcion: p.descripcion,
      cantidad_afectados: p.cantidadAfectados,
      latitud: p.latitud,
      longitud: p.longitud,
      precision_metros: p.precisionMetros ?? null,
      direccion_referencia: p.direccionReferencia ?? null,
      ubicacion_confirmada: p.ubicacionConfirmada,
      puede_hablar: p.puedeHablar,
      metadata: p.metadata ?? null,
      reportada_at: p.reportadaAt,
      finalizada_at: p.finalizadaAt ?? null,
    };
  }

  // ---- consultas del agregado -------------------------------------------

  async contarTodas(): Promise<Result<number>> {
    return Result.ok(await this.model.count());
  }

  async contarActivas(): Promise<Result<number>> {
    const total = await this.model.count({
      include: [
        {
          model: db().models.estadoEmergencia,
          as: "estado",
          where: { es_final: false },
          required: true,
        },
      ],
    });
    return Result.ok(total);
  }

  async listarConRelaciones(
    query: EmergenciaListadoQuery,
  ): Promise<Result<ListadoEmergencias>> {
    const where: Record<string | symbol, unknown> = {};
    const search = String(query.q || "").trim();
    if (search) {
      where[Op.or] = ["codigo_publico", "gravedad"].map((field) => ({
        [field]: { [Op.like]: `%${search}%` },
      }));
    }
    if (query.estadoId) where.estado_id = query.estadoId;

    const result = await this.model.findAndCountAll({
      where,
      include: [
        { model: db().models.tipoEmergencia, as: "tipo" },
        { model: db().models.estadoEmergencia, as: "estado" },
        {
          model: db().models.ciudadano,
          as: "ciudadano",
          attributes: ["id", "uuid", "email", "telefono"],
          include: [{ model: db().models.perfil, as: "perfil" }],
        },
        {
          model: db().models.usuario,
          as: "operador",
          required: false,
          attributes: ["id", "fullname", "celular"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: query.limit,
      offset: query.offset,
      distinct: true,
    });
    return Result.ok({ rows: result.rows, count: result.count });
  }

  async obtenerDetallePorUuid(
    uuid: string,
  ): Promise<Result<EmergenciaConRelaciones | null>> {
    const emergencia = await this.model.findOne({
      where: { uuid },
      include: [
        { model: db().models.tipoEmergencia, as: "tipo" },
        { model: db().models.estadoEmergencia, as: "estado" },
        { model: db().models.centroSalud, as: "centro", required: false },
        {
          model: db().models.ciudadano,
          as: "ciudadano",
          include: [
            { model: db().models.perfil, as: "perfil" },
            { model: db().models.contactoEmergencia, as: "contactos" },
          ],
        },
        {
          model: db().models.usuario,
          as: "operador",
          required: false,
          attributes: ["id", "fullname", "celular"],
        },
        { model: db().models.respuestaTriage, as: "triage" },
        { model: db().models.evidenciaEmergencia, as: "evidencias" },
      ],
    });
    if (!emergencia) return Result.ok(null);

    const historial = await db().models.historialEmergencia.findAll({
      where: { emergencia_id: emergencia.id },
      include: [{ model: db().models.estadoEmergencia, as: "estadoNuevo" }],
      order: [["created_at", "ASC"]],
    });
    return Result.ok({ ...emergencia.toJSON(), historial });
  }

  async listarPorCiudadano(
    ciudadanoId: number,
  ): Promise<Result<EmergenciaConRelaciones[]>> {
    const filas = await this.model.findAll({
      where: { usuario_id: ciudadanoId },
      include: [
        { model: db().models.tipoEmergencia, as: "tipo" },
        { model: db().models.estadoEmergencia, as: "estado" },
      ],
      order: [["created_at", "DESC"]],
    });
    return Result.ok(filas);
  }

  async obtenerDetalleDeCiudadano(
    uuid: string,
    ciudadanoId: number,
  ): Promise<Result<EmergenciaConRelaciones | null>> {
    const where: Record<string, unknown> = { uuid };
    if (ciudadanoId) where.usuario_id = ciudadanoId;

    const emergencia = await this.model.findOne({
      where,
      include: [
        { model: db().models.tipoEmergencia, as: "tipo" },
        { model: db().models.estadoEmergencia, as: "estado" },
        { model: db().models.centroSalud, as: "centro", required: false },
        {
          model: db().models.evidenciaEmergencia,
          as: "evidencias",
          required: false,
        },
      ],
    });
    if (!emergencia) return Result.ok(null);

    const historial = await db().models.historialEmergencia.findAll({
      where: { emergencia_id: emergencia.id },
      include: [{ model: db().models.estadoEmergencia, as: "estadoNuevo" }],
      order: [["created_at", "ASC"]],
    });
    const operador = emergencia.operador_id
      ? await db().models.usuario.findByPk(emergencia.operador_id)
      : null;

    return Result.ok({
      ...emergencia.toJSON(),
      historial: historial.map((item: any) => item.toJSON()),
      operador: operador
        ? {
            id: operador.id,
            nombre: operador.fullname || operador.nombre,
            telefono: operador.celular || null,
          }
        : null,
    });
  }

  async buscarPorIdempotencia(
    ciudadanoId: number,
    idempotencyKey: string,
  ): Promise<Result<EmergenciaConRelaciones | null>> {
    const fila = await this.model.findOne({
      where: { usuario_id: ciudadanoId, idempotency_key: idempotencyKey },
    });
    return Result.ok(fila ? { uuid: String(fila.uuid) } : null);
  }

  async obtenerEstadoActual(uuid: string): Promise<Result<EstadoActual | null>> {
    const fila = await this.model.findOne({
      where: { uuid },
      include: [{ model: db().models.estadoEmergencia, as: "estado" }],
    });
    if (!fila) return Result.ok(null);
    return Result.ok({
      emergenciaId: Number(fila.id),
      estadoId: Number(fila.estado_id),
      estadoEsFinal: Boolean(fila.estado?.es_final),
    });
  }

  async aplicarCambioOperativo(
    uuid: string,
    cambios: CambioOperativo,
    historial: EntradaHistorial | null,
  ): Promise<Result<boolean>> {
    const transaction = await db().sequelize.transaction();
    try {
      const emergencia = await this.model.findOne({
        where: { uuid },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!emergencia) {
        await transaction.rollback();
        return Result.noEncontrado<boolean>("Emergencia no encontrada");
      }

      const valores: Record<string, unknown> = {};
      if (cambios.estadoId !== undefined) valores.estado_id = cambios.estadoId;
      if (cambios.finalizadaAt !== undefined)
        valores.finalizada_at = cambios.finalizadaAt;
      if (cambios.operadorId !== undefined)
        valores.operador_id = cambios.operadorId;

      if (Object.keys(valores).length > 0) {
        await emergencia.update(valores, { transaction });
      }
      if (historial) {
        await db().models.historialEmergencia.create(
          {
            emergencia_id: emergencia.id,
            estado_anterior_id: historial.estadoAnteriorId,
            estado_nuevo_id: historial.estadoNuevoId,
            actor_admin_id: historial.actorAdminId ?? null,
            actor_usuario_id: historial.actorCiudadanoId ?? null,
            observacion: historial.observacion,
          },
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

  async registrarNueva(datos: NuevaEmergencia): Promise<Result<string>> {
    const transaction = await db().sequelize.transaction();
    try {
      const emergencia = await this.model.create(
        {
          uuid: datos.uuid,
          codigo_publico: `TMP-${datos.uuid}`,
          idempotency_key: datos.idempotencyKey,
          usuario_id: datos.ciudadanoId,
          tipo_emergencia_id: datos.tipoEmergenciaId,
          estado_id: datos.estadoId,
          gravedad: datos.gravedad,
          puntaje_triage: datos.puntajeTriage,
          descripcion: datos.descripcion ?? null,
          latitud: datos.latitud,
          longitud: datos.longitud,
          precision_metros: datos.precisionMetros ?? null,
          direccion_referencia: datos.direccionReferencia ?? null,
          ubicacion_confirmada: datos.ubicacionConfirmada,
          puede_hablar: datos.puedeHablar,
          metadata: datos.metadata ?? null,
          reportada_at: new Date(),
        },
        { transaction },
      );

      const codigo = `EMG-${new Date().getFullYear()}-${String(emergencia.id).padStart(6, "0")}`;
      await emergencia.update({ codigo_publico: codigo }, { transaction });

      await Promise.all(
        datos.triage.map((respuesta) =>
          db().models.respuestaTriage.create(
            {
              emergencia_id: emergencia.id,
              pregunta_codigo: respuesta.preguntaCodigo,
              pregunta_texto: respuesta.preguntaTexto,
              opcion_codigo: respuesta.opcionCodigo,
              respuesta_texto: respuesta.respuestaTexto,
              peso_aplicado: respuesta.pesoAplicado,
            },
            { transaction },
          ),
        ),
      );

      await db().models.historialEmergencia.create(
        {
          emergencia_id: emergencia.id,
          estado_anterior_id: null,
          estado_nuevo_id: datos.estadoId,
          actor_usuario_id: datos.ciudadanoId,
          observacion: datos.observacionHistorial,
          latitud: datos.latitud,
          longitud: datos.longitud,
        },
        { transaction },
      );

      await transaction.commit();
      return Result.ok(String(emergencia.uuid));
    } catch (error) {
      await transaction.rollback();
      return Result.fail<string>(String((error as Error).message), "INTERNO");
    }
  }
}
