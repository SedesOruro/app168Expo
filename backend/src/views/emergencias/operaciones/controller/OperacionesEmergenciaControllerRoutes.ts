import crypto from "crypto";
import { Router } from "express";
import { Op } from "sequelize";
import { Database } from "../../../../config/database";
import { checkIfAdmin, checkIfOperationalStaff } from "../../../../middlewares/authMiddleware";

const database = () => Database.getInstance();

const pagination = (query: Record<string, unknown>) => {
  const limit = Math.min(Math.max(Number(query._limit || 10), 1), 100);
  const page = Math.max(Number(query._page || 1), 1);
  return { limit, offset: (page - 1) * limit };
};

const searchWhere = (query: Record<string, unknown>, fields: string[]) => {
  const search = String(query.q || "").trim();
  if (!search) return {};
  return {
    [Op.or]: fields.map((field) => ({ [field]: { [Op.like]: `%${search}%` } })),
  };
};

export const emergencyAdminRoutes = Router();

emergencyAdminRoutes.use(checkIfOperationalStaff);

emergencyAdminRoutes.get("/dashboard", async (_req, res, next) => {
  try {
    const [emergencies, active, citizens, centers] = await Promise.all([
      database().models.emergencia.count(),
      database().models.emergencia.count({
        include: [
          {
            model: database().models.estadoEmergencia,
            as: "estado",
            where: { es_final: false },
            required: true,
          },
        ],
      }),
      database().models.ciudadano.count({ where: { estado: "ACTIVO" } }),
      database().models.centroSalud.count({ where: { activo: true } }),
    ]);
    return res.json({ emergencies, active, citizens, centers });
  } catch (error) {
    return next(error);
  }
});

export default emergencyAdminRoutes;

emergencyAdminRoutes.get("/emergencies", async (req, res, next) => {
  try {
    const { limit, offset } = pagination(req.query as Record<string, unknown>);
    const where: Record<string | symbol, unknown> = {
      ...searchWhere(req.query as Record<string, unknown>, ["codigo_publico", "gravedad"]),
    };
    if (req.query.estado) where.estado_id = Number(req.query.estado);
    const result = await database().models.emergencia.findAndCountAll({
      where,
      include: [
        { model: database().models.tipoEmergencia, as: "tipo" },
        { model: database().models.estadoEmergencia, as: "estado" },
        {
          model: database().models.ciudadano,
          as: "ciudadano",
          attributes: ["id", "uuid", "email", "telefono"],
          include: [{ model: database().models.perfil, as: "perfil" }],
        },
        { model: database().models.usuario, as: "operador", required: false, attributes: ["id", "fullname", "celular"] },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
      distinct: true,
    });
    return res.json({ rows: result.rows, count: result.count });
  } catch (error) {
    return next(error);
  }
});

emergencyAdminRoutes.get("/emergencies/:uuid", async (req, res, next) => {
  try {
    const emergency = await database().models.emergencia.findOne({
      where: { uuid: req.params.uuid },
      include: [
        { model: database().models.tipoEmergencia, as: "tipo" },
        { model: database().models.estadoEmergencia, as: "estado" },
        { model: database().models.centroSalud, as: "centro", required: false },
        {
          model: database().models.ciudadano,
          as: "ciudadano",
          include: [
            { model: database().models.perfil, as: "perfil" },
            { model: database().models.contactoEmergencia, as: "contactos" },
          ],
        },
        { model: database().models.usuario, as: "operador", required: false, attributes: ["id", "fullname", "celular"] },
        { model: database().models.respuestaTriage, as: "triage" },
        { model: database().models.evidenciaEmergencia, as: "evidencias" },
      ],
    });
    if (!emergency) return res.status(404).json({ error: "Emergencia no encontrada" });
    const history = await database().models.historialEmergencia.findAll({
      where: { emergencia_id: emergency.id },
      include: [{ model: database().models.estadoEmergencia, as: "estadoNuevo" }],
      order: [["created_at", "ASC"]],
    });
    return res.json({ ...emergency.toJSON(), historial: history });
  } catch (error) {
    return next(error);
  }
});

emergencyAdminRoutes.patch("/emergencies/:uuid", async (req, res, next) => {
  const transaction = await database().sequelize.transaction();
  try {
    const emergency = await database().models.emergencia.findOne({
      where: { uuid: req.params.uuid },
      include: [{ model: database().models.estadoEmergencia, as: "estado" }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!emergency) {
      await transaction.rollback();
      return res.status(404).json({ error: "Emergencia no encontrada" });
    }

    const previousStatusId = Number(emergency.estado_id);
    const changes: Record<string, unknown> = {};
    let nextStatus: any = null;
    if (req.body.statusCode) {
      nextStatus = await database().models.estadoEmergencia.findOne({
        where: { codigo: String(req.body.statusCode).toUpperCase(), activo: true },
        transaction,
      });
      if (!nextStatus) {
        await transaction.rollback();
        return res.status(400).json({ error: "Estado no valido" });
      }
      if (emergency.estado?.es_final && emergency.estado_id !== nextStatus.id) {
        await transaction.rollback();
        return res.status(409).json({ error: "Una emergencia finalizada no puede reabrirse" });
      }
      changes.estado_id = nextStatus.id;
      if (nextStatus.es_final) changes.finalizada_at = new Date();
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "operatorId")) {
      const operatorId = req.body.operatorId ? String(req.body.operatorId) : null;
      if (operatorId) {
        const operator = await database().models.usuario.findByPk(operatorId, { transaction });
        if (!operator || !operator.activo) {
          await transaction.rollback();
          return res.status(400).json({ error: "Operador no disponible" });
        }
      }
      changes.operador_id = operatorId;
    }

    await emergency.update(changes, { transaction });
    if (nextStatus && previousStatusId !== Number(nextStatus.id)) {
      await database().models.historialEmergencia.create(
        {
          emergencia_id: emergency.id,
          estado_anterior_id: previousStatusId,
          estado_nuevo_id: nextStatus.id,
          actor_admin_id: req.authId,
          observacion: String(req.body.observation || "Actualizacion desde administracion"),
        },
        { transaction },
      );
    }
    await transaction.commit();
    return res.json({ updated: true });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

emergencyAdminRoutes.get("/statuses", async (_req, res, next) => {
  try {
    return res.json(
      await database().models.estadoEmergencia.findAll({
        where: { activo: true },
        order: [["orden", "ASC"]],
      }),
    );
  } catch (error) {
    return next(error);
  }
});

emergencyAdminRoutes.get("/operators", async (_req, res, next) => {
  try {
    const rows = await database().models.usuario.findAll({
      where: { activo: true },
      include: [{ model: database().models.rol, as: "rol", where: { tipo: "operador" } }],
      attributes: ["id", "fullname", "nombre", "celular"],
    });
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

emergencyAdminRoutes.get("/citizens", async (req, res, next) => {
  try {
    const { limit, offset } = pagination(req.query as Record<string, unknown>);
    const result = await database().models.ciudadano.findAndCountAll({
      where: searchWhere(req.query as Record<string, unknown>, ["email", "telefono"]),
      include: [{ model: database().models.perfil, as: "perfil" }],
      order: [["created_at", "DESC"]],
      limit,
      offset,
      distinct: true,
    });
    return res.json({ rows: result.rows, count: result.count });
  } catch (error) {
    return next(error);
  }
});

emergencyAdminRoutes.patch("/citizens/:uuid/status", checkIfAdmin, async (req, res, next) => {
  try {
    const ciudadano = await database().models.ciudadano.findOne({ where: { uuid: req.params.uuid } });
    if (!ciudadano) return res.status(404).json({ error: "Ciudadano no encontrado" });
    const status = req.body.active === false ? "INACTIVO" : "ACTIVO";
    await ciudadano.update({ estado: status });
    return res.json({ updated: true, status });
  } catch (error) {
    return next(error);
  }
});

emergencyAdminRoutes.get("/health-centers", async (req, res, next) => {
  try {
    const { limit, offset } = pagination(req.query as Record<string, unknown>);
    const sortableFields = new Set(["nombre", "codigo_rues", "municipio", "localidad", "created_at"]);
    const requestedSort = String(req.query._sort || "nombre");
    const sort = sortableFields.has(requestedSort) ? requestedSort : "nombre";
    const order = String(req.query._order || "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC";
    const result = await database().models.centroSalud.findAndCountAll({
      where: searchWhere(req.query as Record<string, unknown>, ["nombre", "codigo_rues", "municipio", "localidad"]),
      order: [[sort, order]],
      limit,
      offset,
    });
    return res.json({ rows: result.rows, count: result.count });
  } catch (error) {
    return next(error);
  }
});

emergencyAdminRoutes.post("/health-centers", checkIfAdmin, async (req, res, next) => {
  try {
    const required = [req.body.codigo_rues, req.body.nombre, req.body.departamento, req.body.red_salud, req.body.municipio];
    if (required.some((value) => !String(value || "").trim())) {
      return res.status(400).json({ error: "Complete los campos obligatorios" });
    }
    const row = await database().models.centroSalud.create({
      ...req.body,
      uuid: crypto.randomUUID(),
      fuente_archivo: "ADMIN_168",
      gestion_fuente: new Date().getFullYear(),
      activo: req.body.activo !== false,
    });
    return res.status(201).json(row);
  } catch (error) {
    return next(error);
  }
});

emergencyAdminRoutes.put("/health-centers/:uuid", checkIfAdmin, async (req, res, next) => {
  try {
    const row = await database().models.centroSalud.findOne({ where: { uuid: req.params.uuid } });
    if (!row) return res.status(404).json({ error: "Centro de salud no encontrado" });
    const fields = [
      "codigo_rues", "departamento", "red_salud", "municipio", "nombre", "subsector",
      "institucion", "nivel", "tipo", "ambito", "localidad", "direccion", "latitud", "longitud", "activo",
    ];
    const changes = Object.fromEntries(
      fields.filter((field) => Object.prototype.hasOwnProperty.call(req.body, field)).map((field) => [field, req.body[field]]),
    );
    await row.update(changes);
    return res.json(row);
  } catch (error) {
    return next(error);
  }
});

emergencyAdminRoutes.delete("/health-centers/:uuid", checkIfAdmin, async (req, res, next) => {
  try {
    const row = await database().models.centroSalud.findOne({ where: { uuid: req.params.uuid } });
    if (!row) return res.status(404).json({ error: "Centro de salud no encontrado" });
    await row.update({ activo: false });
    return res.json({ deleted: true });
  } catch (error) {
    return next(error);
  }
});
