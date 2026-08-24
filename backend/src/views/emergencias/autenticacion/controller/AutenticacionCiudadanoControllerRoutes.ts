import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Router } from "express";
import { Op } from "sequelize";
import { Database } from "../../../../config/database";
import { env } from "../../../../config/env";
import { checkIfCiudadanoAuthenticated } from "../../../../middlewares/ciudadanoAuthMiddleware";
import { signToken } from "../../../../utils/jwt";

type RegistrationInput = {
  names?: string;
  surnames?: string;
  document?: string;
  complement?: string;
  birthDate?: string;
  phone?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  email?: string;
  password?: string;
  acceptedTerms?: boolean;
};

const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

const requestIp = (req: Request): string | null =>
  req.ip || req.socket.remoteAddress || null;

const userDto = async (ciudadano: any, transaction?: any) => {
  const perfil = await Database.getInstance().models.perfil.findOne({
    where: { usuario_id: ciudadano.id },
    transaction,
  });
  const name = perfil
    ? `${perfil.nombres} ${perfil.apellidos}`.trim()
    : String(ciudadano.email);
  return {
    id: String(ciudadano.uuid),
    name,
    email: String(ciudadano.email),
  };
};

const issueSession = async (
  ciudadano: any,
  req: Request,
  transaction?: any,
) => {
  const db = Database.getInstance();
  const accessToken = signToken({
    uid: String(ciudadano.uuid),
    email: String(ciudadano.email),
    rol: "ciudadano",
    kind: "ciudadano",
  });
  const refreshToken = crypto.randomBytes(48).toString("base64url");
  const jti = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + env.jwt.refreshDays);

  await db.models.sesionRefresh.create(
    {
      usuario_id: ciudadano.id,
      jti,
      token_hash: hashToken(refreshToken),
      dispositivo: String(req.headers["user-agent"] || "").slice(0, 255) || null,
      ip_origen: requestIp(req),
      expira_at: expiresAt,
    },
    { transaction },
  );

  return {
    user: await userDto(ciudadano, transaction),
    accessToken,
    refreshToken,
  };
};

export const autenticacionCiudadanoRoutes = Router();

autenticacionCiudadanoRoutes.post("/register", async (req, res, next) => {
  const input = req.body as RegistrationInput;
  const required = [
    input.names,
    input.surnames,
    input.document,
    input.birthDate,
    input.phone,
    input.address,
    input.contactName,
    input.contactPhone,
    input.email,
    input.password,
  ];
  if (required.some((value) => !String(value || "").trim())) {
    return res.status(400).json({ error: "Complete todos los campos obligatorios" });
  }
  if (!input.acceptedTerms) {
    return res.status(400).json({ error: "Debe aceptar los terminos y condiciones" });
  }
  if (String(input.password).length < 8) {
    return res.status(400).json({ error: "La contrasena debe tener al menos 8 caracteres" });
  }

  const db = Database.getInstance();
  const transaction = await db.sequelize.transaction();
  try {
    const email = String(input.email).trim().toLowerCase();
    const phone = String(input.phone).trim();
    const duplicate = await db.models.ciudadano.findOne({
      where: { [Op.or]: [{ email }, { telefono: phone }] },
      paranoid: false,
      transaction,
    });
    if (duplicate) {
      await transaction.rollback();
      return res.status(409).json({ error: "El correo o telefono ya esta registrado" });
    }

    const documentExists = await db.models.perfil.findOne({
      where: {
        cedula_identidad: String(input.document).trim(),
        complemento_ci: String(input.complement || "").trim() || null,
      },
      transaction,
    });
    if (documentExists) {
      await transaction.rollback();
      return res.status(409).json({ error: "La cedula de identidad ya esta registrada" });
    }

    const ciudadano = await db.models.ciudadano.create(
      {
        uuid: crypto.randomUUID(),
        email,
        telefono: phone,
        password_hash: await bcrypt.hash(String(input.password), 10),
        rol: "CIUDADANO",
        estado: "ACTIVO",
      },
      { transaction },
    );
    await db.models.perfil.create(
      {
        usuario_id: ciudadano.id,
        nombres: String(input.names).trim(),
        apellidos: String(input.surnames).trim(),
        cedula_identidad: String(input.document).trim(),
        complemento_ci: String(input.complement || "").trim() || null,
        fecha_nacimiento: String(input.birthDate),
        direccion: String(input.address).trim(),
        terminos_version: "1.0",
        terminos_aceptados_at: new Date(),
      },
      { transaction },
    );
    await db.models.contactoEmergencia.create(
      {
        usuario_id: ciudadano.id,
        nombre_completo: String(input.contactName).trim(),
        parentesco: "CONTACTO",
        telefono: String(input.contactPhone).trim(),
        es_principal: true,
        activo: true,
      },
      { transaction },
    );

    const session = await issueSession(ciudadano, req, transaction);
    await transaction.commit();
    return res.status(201).json(session);
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

autenticacionCiudadanoRoutes.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) {
      return res.status(400).json({ error: "Correo y contrasena son requeridos" });
    }

    const ciudadano = await Database.getInstance().models.ciudadano.findOne({ where: { email } });
    const isValid = ciudadano
      ? await bcrypt.compare(password, String(ciudadano.password_hash))
      : false;
    if (!ciudadano || !isValid || ciudadano.estado !== "ACTIVO") {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    await ciudadano.update({ ultimo_acceso_at: new Date() });
    return res.json(await issueSession(ciudadano, req));
  } catch (error) {
    return next(error);
  }
});

autenticacionCiudadanoRoutes.post("/refresh", async (req, res, next) => {
  const refreshToken = String(req.body.refreshToken || "");
  if (!refreshToken) return res.status(400).json({ error: "refreshToken es requerido" });

  const db = Database.getInstance();
  const transaction = await db.sequelize.transaction();
  try {
    const session = await db.models.sesionRefresh.findOne({
      where: {
        token_hash: hashToken(refreshToken),
        revocado_at: null,
        expira_at: { [Op.gt]: new Date() },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!session) {
      await transaction.rollback();
      return res.status(401).json({ error: "Sesion expirada o revocada" });
    }

    const ciudadano = await db.models.ciudadano.findByPk(session.usuario_id, { transaction });
    if (!ciudadano || ciudadano.estado !== "ACTIVO") {
      await transaction.rollback();
      return res.status(401).json({ error: "Cuenta no disponible" });
    }

    const nextSession = await issueSession(ciudadano, req, transaction);
    const replacement = await db.models.sesionRefresh.findOne({
      where: { token_hash: hashToken(nextSession.refreshToken) },
      transaction,
    });
    await session.update(
      { revocado_at: new Date(), reemplazado_por_jti: replacement?.jti || null },
      { transaction },
    );
    await transaction.commit();
    return res.json(nextSession);
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

autenticacionCiudadanoRoutes.post("/logout", async (req, res, next) => {
  try {
    const refreshToken = String(req.body.refreshToken || "");
    if (refreshToken) {
      await Database.getInstance().models.sesionRefresh.update(
        { revocado_at: new Date() },
        { where: { token_hash: hashToken(refreshToken), revocado_at: null } },
      );
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

autenticacionCiudadanoRoutes.get("/me", checkIfCiudadanoAuthenticated, async (req, res, next) => {
  try {
    const ciudadano = await Database.getInstance().models.ciudadano.findByPk(req.authCiudadanoId);
    if (!ciudadano) return res.status(404).json({ error: "Ciudadano no encontrado" });
    return res.json(await userDto(ciudadano));
  } catch (error) {
    return next(error);
  }
});

export default autenticacionCiudadanoRoutes;
