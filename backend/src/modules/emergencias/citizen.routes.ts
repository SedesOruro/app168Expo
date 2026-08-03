import crypto from "crypto";
import { Router } from "express";
import { Op } from "sequelize";
import multer from "multer";
import mime from "mime-types";
import { Database } from "../../config/database";
import { checkIfCitizenAuthenticated } from "../../middlewares/citizenAuthMiddleware";
import { storageProvider } from "../../storage/storage.provider";

const db = () => Database.getInstance();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const numberOrNull = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const distanceKm = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number => {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latDelta = radians(toLat - fromLat);
  const lngDelta = radians(toLng - fromLng);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(radians(fromLat)) *
      Math.cos(radians(toLat)) *
      Math.sin(lngDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const emergencyDetail = async (uuid: string, citizenId?: number) => {
  const where: Record<string, unknown> = { uuid };
  if (citizenId) where.usuario_id = citizenId;
  const emergency = await db().models.emergencia.findOne({
    where,
    include: [
      { model: db().models.tipoEmergencia, as: "tipo" },
      { model: db().models.estadoEmergencia, as: "estado" },
      { model: db().models.centroSalud, as: "centro", required: false },
      { model: db().models.evidenciaEmergencia, as: "evidencias", required: false },
    ],
  });
  if (!emergency) return null;

  const history = await db().models.historialEmergencia.findAll({
    where: { emergencia_id: emergency.id },
    include: [{ model: db().models.estadoEmergencia, as: "estadoNuevo" }],
    order: [["created_at", "ASC"]],
  });
  const operator = emergency.operador_id
    ? await db().models.usuario.findByPk(emergency.operador_id)
    : null;

  return {
    ...emergency.toJSON(),
    historial: history.map((item: any) => item.toJSON()),
    operador: operator
      ? {
          id: operator.id,
          nombre: operator.fullname || operator.nombre,
          telefono: operator.celular || null,
        }
      : null,
  };
};

export const citizenRoutes = Router();

citizenRoutes.use(checkIfCitizenAuthenticated);

citizenRoutes.post("/uploads", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file es requerido" });
    if (!/^(image|audio)\//.test(req.file.mimetype)) {
      return res.status(415).json({ error: "Solo se permiten imagenes o audios" });
    }
    const detectedExtension = mime.extension(req.file.mimetype);
    const extension = detectedExtension ? `.${detectedExtension}` : "";
    const fileName = `${req.authCitizenUuid}-${crypto.randomUUID()}${extension}`;
    const file = await storageProvider.upload(fileName, req.file.buffer);
    return res.status(201).json({ file, name: fileName, mimeType: req.file.mimetype });
  } catch (error) {
    return next(error);
  }
});

citizenRoutes.get("/catalogs/emergency-types", async (_req, res, next) => {
  try {
    const rows = await db().models.tipoEmergencia.findAll({
      where: { activo: true },
      order: [["orden", "ASC"]],
    });
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

citizenRoutes.get("/health-centers", async (req, res, next) => {
  try {
    const oruroKmZero = { latitude: -17.9695681, longitude: -67.1147287 };
    const search = String(req.query.q || "").trim();
    const limit = Math.min(Math.max(Number(req.query.limit || 30), 1), 100);
    const latitude = numberOrNull(req.query.lat) ?? oruroKmZero.latitude;
    const longitude = numberOrNull(req.query.lng) ?? oruroKmZero.longitude;
    const where: Record<string | symbol, unknown> = {
      activo: true,
      departamento: "Oruro",
    };
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { municipio: { [Op.like]: `%${search}%` } },
        { localidad: { [Op.like]: `%${search}%` } },
        { codigo_rues: { [Op.like]: `%${search}%` } },
      ];
    }

    const rows = await db().models.centroSalud.findAll({ where });
    const result = rows
      .map((row: any) => {
        const item = row.toJSON();
        const lat = numberOrNull(item.latitud);
        const lng = numberOrNull(item.longitud);
        return {
          ...item,
          distanceKm:
            lat !== null && lng !== null
              ? distanceKm(latitude, longitude, lat, lng)
              : null,
        };
      })
      .sort((a: any, b: any) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      })
      .slice(0, limit);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

citizenRoutes.get("/profile", async (req, res, next) => {
  try {
    const citizen = await db().models.ciudadano.findByPk(req.authCitizenId);
    if (!citizen) return res.status(404).json({ error: "Ciudadano no encontrado" });
    const [profile, contacts] = await Promise.all([
      db().models.perfil.findOne({ where: { usuario_id: citizen.id } }),
      db().models.contactoEmergencia.findAll({
        where: { usuario_id: citizen.id, activo: true },
        order: [["es_principal", "DESC"]],
      }),
    ]);
    return res.json({
      id: citizen.uuid,
      email: citizen.email,
      phone: citizen.telefono,
      profile,
      contacts,
    });
  } catch (error) {
    return next(error);
  }
});

citizenRoutes.put("/profile", async (req, res, next) => {
  const transaction = await db().sequelize.transaction();
  try {
    const citizen = await db().models.ciudadano.findByPk(req.authCitizenId, { transaction });
    const profile = await db().models.perfil.findOne({
      where: { usuario_id: req.authCitizenId },
      transaction,
    });
    if (!citizen || !profile) {
      await transaction.rollback();
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    const allowedProfileFields = [
      "nombres",
      "apellidos",
      "fecha_nacimiento",
      "sexo",
      "tipo_sangre",
      "direccion",
      "departamento",
      "municipio",
      "alergias",
      "enfermedades_cronicas",
      "medicamentos_actuales",
      "condiciones_relevantes",
      "seguro_medico",
      "numero_seguro",
    ];
    const profileChanges = Object.fromEntries(
      allowedProfileFields
        .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
        .map((field) => [field, req.body[field] || null]),
    );
    await profile.update(profileChanges, { transaction });

    if (Object.prototype.hasOwnProperty.call(req.body, "phone")) {
      await citizen.update({ telefono: String(req.body.phone || "").trim() }, { transaction });
    }

    if (req.body.contact) {
      const current = await db().models.contactoEmergencia.findOne({
        where: { usuario_id: citizen.id, es_principal: true, activo: true },
        transaction,
      });
      const contactData = {
        nombre_completo: String(req.body.contact.name || "").trim(),
        telefono: String(req.body.contact.phone || "").trim(),
        parentesco: String(req.body.contact.relationship || "CONTACTO").trim(),
      };
      if (!contactData.nombre_completo || !contactData.telefono) {
        await transaction.rollback();
        return res.status(400).json({ error: "Nombre y telefono del contacto son requeridos" });
      }
      if (current) await current.update(contactData, { transaction });
      else {
        await db().models.contactoEmergencia.create(
          { ...contactData, usuario_id: citizen.id, es_principal: true, activo: true },
          { transaction },
        );
      }
    }

    await transaction.commit();
    return res.json({ updated: true });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

citizenRoutes.post("/emergencies", async (req, res, next) => {
  const latitude = numberOrNull(req.body.latitude);
  const longitude = numberOrNull(req.body.longitude);
  if (latitude === null || longitude === null || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: "Se requiere una ubicacion valida para reportar la emergencia" });
  }

  const transaction = await db().sequelize.transaction();
  try {
    const typeCode = String(req.body.typeCode || "MEDICA").trim().toUpperCase();
    const type = await db().models.tipoEmergencia.findOne({
      where: { codigo: typeCode, activo: true },
      transaction,
    });
    const status = await db().models.estadoEmergencia.findOne({
      where: { codigo: "REPORTADA", activo: true },
      transaction,
    });
    if (!type || !status) {
      await transaction.rollback();
      return res.status(400).json({ error: "Catalogos de emergencia no configurados" });
    }

    const triage = (req.body.triage || {}) as Record<string, string>;
    const severity = String(req.body.severity || "ALTA").toUpperCase();
    const score =
      (severity === "ALTA" ? 30 : severity === "MEDIA" ? 15 : 0) +
      (triage.breathing === "NO" ? 50 : 0) +
      (triage.conscious === "NO" ? 30 : 0) +
      (triage.danger === "SI" ? 20 : 0);
    const idempotencyKey = String(req.body.idempotencyKey || crypto.randomUUID());
    const existing = await db().models.emergencia.findOne({
      where: { usuario_id: req.authCitizenId, idempotency_key: idempotencyKey },
      transaction,
    });
    if (existing) {
      await transaction.commit();
      return res.json(await emergencyDetail(String(existing.uuid), req.authCitizenId));
    }

    const emergency = await db().models.emergencia.create(
      {
        uuid: crypto.randomUUID(),
        codigo_publico: `TMP-${crypto.randomUUID()}`,
        idempotency_key: idempotencyKey,
        usuario_id: req.authCitizenId,
        tipo_emergencia_id: type.id,
        estado_id: status.id,
        gravedad: severity,
        puntaje_triage: score,
        descripcion: String(req.body.description || "").trim() || null,
        latitud: latitude,
        longitud: longitude,
        precision_metros: numberOrNull(req.body.accuracy),
        direccion_referencia: String(req.body.address || "").trim() || null,
        ubicacion_confirmada: Boolean(req.body.locationConfirmed),
        puede_hablar: req.body.canSpeak !== false,
        metadata: { batteryLevel: numberOrNull(req.body.batteryLevel), flow: req.body.flow || "guided" },
        reportada_at: new Date(),
      },
      { transaction },
    );
    const code = `EMG-${new Date().getFullYear()}-${String(emergency.id).padStart(6, "0")}`;
    await emergency.update({ codigo_publico: code }, { transaction });

    const questions = [
      ["breathing", "La persona respira?"],
      ["conscious", "Esta consciente?"],
      ["danger", "Hay riesgo en el lugar?"],
    ];
    await Promise.all(
      questions.map(([key, label]) =>
        db().models.respuestaTriage.create(
          {
            emergencia_id: emergency.id,
            pregunta_codigo: key,
            pregunta_texto: label,
            opcion_codigo: triage[key] || "NO_SE",
            respuesta_texto: triage[key] || "NO_SE",
            peso_aplicado: 0,
          },
          { transaction },
        ),
      ),
    );
    await db().models.historialEmergencia.create(
      {
        emergencia_id: emergency.id,
        estado_anterior_id: null,
        estado_nuevo_id: status.id,
        actor_usuario_id: req.authCitizenId,
        observacion: "Emergencia reportada desde la aplicacion movil",
        latitud: latitude,
        longitud: longitude,
      },
      { transaction },
    );

    await transaction.commit();
    return res.status(201).json(await emergencyDetail(String(emergency.uuid), req.authCitizenId));
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

citizenRoutes.get("/emergencies", async (req, res, next) => {
  try {
    const rows = await db().models.emergencia.findAll({
      where: { usuario_id: req.authCitizenId },
      include: [
        { model: db().models.tipoEmergencia, as: "tipo" },
        { model: db().models.estadoEmergencia, as: "estado" },
      ],
      order: [["created_at", "DESC"]],
    });
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

citizenRoutes.get("/emergencies/:uuid", async (req, res, next) => {
  try {
    const detail = await emergencyDetail(req.params.uuid, req.authCitizenId);
    if (!detail) return res.status(404).json({ error: "Emergencia no encontrada" });
    return res.json(detail);
  } catch (error) {
    return next(error);
  }
});

citizenRoutes.post("/emergencies/:uuid/evidence", async (req, res, next) => {
  try {
    const emergency = await db().models.emergencia.findOne({
      where: { uuid: req.params.uuid, usuario_id: req.authCitizenId },
    });
    if (!emergency) return res.status(404).json({ error: "Emergencia no encontrada" });

    const type = String(req.body.type || "NOTA").toUpperCase();
    if (!["NOTA", "FOTO", "AUDIO"].includes(type)) {
      return res.status(400).json({ error: "Tipo de evidencia no valido" });
    }
    if (type === "NOTA" && !String(req.body.content || "").trim()) {
      return res.status(400).json({ error: "La nota no puede estar vacia" });
    }
    if (type !== "NOTA" && !String(req.body.fileUrl || "").trim()) {
      return res.status(400).json({ error: "El archivo de evidencia es requerido" });
    }

    const evidence = await db().models.evidenciaEmergencia.create({
      uuid: crypto.randomUUID(),
      emergencia_id: emergency.id,
      tipo: type,
      contenido: String(req.body.content || "").trim() || null,
      archivo_url: String(req.body.fileUrl || "").trim() || null,
      mime_type: String(req.body.mimeType || "").trim() || null,
      duracion_segundos: numberOrNull(req.body.durationSeconds),
    });
    return res.status(201).json(evidence);
  } catch (error) {
    return next(error);
  }
});
