import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Database } from "../config/database";
import { env } from "../config/env";
import RolService from "../core/system/autenticacion/rol";
import UsuarioService from "../core/system/autenticacion/usuario";
import { SECURITY_IDS } from "./securitySeed";

type PersonalSemilla = {
  email: string;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  ci: string;
  celular: string;
  genero: "MASCULINO" | "FEMENINO" | "NINGUNO";
  rolId: string;
};

type RespuestasTriage = {
  breathing: string;
  conscious: string;
  danger: string;
};

type CiudadanoSemilla = {
  email: string;
  telefono: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  fechaNacimiento: string;
  sexo: string;
  tipoSangre: string;
  direccion: string;
  municipio: string;
  contacto: { nombre: string; parentesco: string; telefono: string };
};

type EmergenciaSemilla = {
  emailCiudadano: string;
  tipo: string;
  estado: string;
  gravedad: "ALTA" | "MEDIA" | "BAJA";
  descripcion: string;
  latitud: number;
  longitud: number;
  direccion: string;
  puedeHablar: boolean;
  triage: RespuestasTriage;
  nota: string;
};

const personal: PersonalSemilla[] = [
  {
    email: "administrador@168.bo",
    nombre: "Rosa",
    primerApellido: "Colque",
    segundoApellido: "Aguilar",
    ci: "4587213",
    celular: "70123456",
    genero: "FEMENINO",
    rolId: SECURITY_IDS.adminRol,
  },
  {
    email: "operador1@168.bo",
    nombre: "Luis",
    primerApellido: "Choque",
    segundoApellido: "Vargas",
    ci: "5231478",
    celular: "70234567",
    genero: "MASCULINO",
    rolId: SECURITY_IDS.operatorRol,
  },
  {
    email: "operador2@168.bo",
    nombre: "Elena",
    primerApellido: "Flores",
    segundoApellido: "Mamani",
    ci: "6398521",
    celular: "70345678",
    genero: "FEMENINO",
    rolId: SECURITY_IDS.operatorRol,
  },
];

const ciudadanos: CiudadanoSemilla[] = [
  {
    email: "ana.condori@example.bo",
    telefono: "71110001",
    nombres: "Ana Lucia",
    apellidos: "Condori Ticona",
    cedula: "7412589",
    fechaNacimiento: "1992-03-18",
    sexo: "FEMENINO",
    tipoSangre: "O+",
    direccion: "Calle Bolivar 452",
    municipio: "Oruro",
    contacto: {
      nombre: "Pedro Condori",
      parentesco: "PADRE",
      telefono: "71110002",
    },
  },
  {
    email: "marco.villca@example.bo",
    telefono: "71110003",
    nombres: "Marco Antonio",
    apellidos: "Villca Apaza",
    cedula: "8523691",
    fechaNacimiento: "1987-11-05",
    sexo: "MASCULINO",
    tipoSangre: "A+",
    direccion: "Av. Espana 1280",
    municipio: "Oruro",
    contacto: {
      nombre: "Silvia Apaza",
      parentesco: "ESPOSA",
      telefono: "71110004",
    },
  },
  {
    email: "rocio.mamani@example.bo",
    telefono: "71110005",
    nombres: "Rocio",
    apellidos: "Mamani Huanca",
    cedula: "9634785",
    fechaNacimiento: "2000-07-23",
    sexo: "FEMENINO",
    tipoSangre: "B+",
    direccion: "Zona Sur, Calle 5 No 18",
    municipio: "Caracollo",
    contacto: {
      nombre: "Julia Huanca",
      parentesco: "MADRE",
      telefono: "71110006",
    },
  },
];

const emergencias: EmergenciaSemilla[] = [
  {
    emailCiudadano: "ana.condori@example.bo",
    tipo: "MEDICA",
    estado: "REPORTADA",
    gravedad: "ALTA",
    descripcion:
      "Persona adulta con dolor toracico intenso y dificultad para respirar",
    latitud: -17.9689,
    longitud: -67.1109,
    direccion: "Plaza 10 de Febrero, acera norte",
    puedeHablar: true,
    triage: { breathing: "SI", conscious: "SI", danger: "NO" },
    nota: "El dolor comenzo hace 20 minutos y no cede",
  },
  {
    emailCiudadano: "marco.villca@example.bo",
    tipo: "ACCIDENTE",
    estado: "EN_CAMINO",
    gravedad: "ALTA",
    descripcion:
      "Colision entre motocicleta y vehiculo liviano, un herido en la via",
    latitud: -17.9812,
    longitud: -67.1245,
    direccion: "Av. Circunvalacion esquina Av. Dehene",
    puedeHablar: true,
    triage: { breathing: "SI", conscious: "NO", danger: "SI" },
    nota: "El herido esta inconsciente pero respira",
  },
  {
    emailCiudadano: "rocio.mamani@example.bo",
    tipo: "INCENDIO",
    estado: "ATENDIDA",
    gravedad: "MEDIA",
    descripcion:
      "Conato de incendio en cocina de vivienda, sin personas atrapadas",
    latitud: -17.6289,
    longitud: -67.2074,
    direccion: "Caracollo, calle principal",
    puedeHablar: true,
    triage: { breathing: "SI", conscious: "SI", danger: "SI" },
    nota: "El fuego fue controlado por los vecinos antes de la llegada",
  },
  {
    emailCiudadano: "ana.condori@example.bo",
    tipo: "SEGURIDAD",
    estado: "VALIDANDO",
    gravedad: "MEDIA",
    descripcion: "Reporte de persona agresiva en la via publica",
    latitud: -17.9723,
    longitud: -67.1156,
    direccion: "Mercado Fermin Lopez",
    puedeHablar: false,
    triage: { breathing: "SI", conscious: "SI", danger: "SI" },
    nota: "La solicitante no puede hablar, reporta por texto",
  },
];

const preguntasTriage: Array<[keyof RespuestasTriage, string]> = [
  ["breathing", "La persona respira?"],
  ["conscious", "Esta consciente?"],
  ["danger", "Hay riesgo en el lugar?"],
];

const puntajeTriage = (
  gravedad: string,
  triage: RespuestasTriage,
): number =>
  (gravedad === "ALTA" ? 30 : gravedad === "MEDIA" ? 15 : 0) +
  (triage.breathing === "NO" ? 50 : 0) +
  (triage.conscious === "NO" ? 30 : 0) +
  (triage.danger === "SI" ? 20 : 0);

const asegurarPersonal = async (): Promise<Map<string, string>> => {
  const password = env.operacionesSeed.password;
  const creados = new Map<string, string>();

  for (const persona of personal) {
    const rol = await RolService.getById(persona.rolId);
    if (rol.isFailure) {
      console.error(
        `[seed] rol ${persona.rolId} inexistente, se omite ${persona.email}`,
      );
      continue;
    }

    const existente = await UsuarioService.findByEmail(persona.email);
    if (existente.isSuccess) {
      creados.set(persona.email, existente.getValue().id);
      continue;
    }

    const resultado = await UsuarioService.creaUsuario({
      email: persona.email,
      password,
      nombre: persona.nombre,
      primerApellido: persona.primerApellido,
      segundoApellido: persona.segundoApellido,
      ci: persona.ci,
      direccion: "Oruro, Bolivia",
      celular: persona.celular,
      genero: persona.genero,
      rolId: persona.rolId,
      avatar: "avatar_default.png",
    });
    if (resultado.isFailure) {
      console.error(
        `[seed] no se pudo crear ${persona.email}: ${resultado.error}`,
      );
      continue;
    }
    creados.set(persona.email, resultado.getValue().id);
    console.log(`[seed] personal creado: ${persona.email}`);
  }

  return creados;
};

const asegurarCiudadanos = async (): Promise<Map<string, number>> => {
  const db = Database.getInstance();
  const password = env.operacionesSeed.password;
  const creados = new Map<string, number>();

  for (const semilla of ciudadanos) {
    const existente = await db.models.ciudadano.findOne({
      where: { email: semilla.email },
      paranoid: false,
    });
    if (existente) {
      creados.set(semilla.email, Number(existente.id));
      continue;
    }

    const transaction = await db.sequelize.transaction();
    try {
      const ciudadano = await db.models.ciudadano.create(
        {
          uuid: crypto.randomUUID(),
          email: semilla.email,
          telefono: semilla.telefono,
          password_hash: await bcrypt.hash(password, 10),
          rol: "CIUDADANO",
          estado: "ACTIVO",
        },
        { transaction },
      );
      await db.models.perfil.create(
        {
          usuario_id: ciudadano.id,
          nombres: semilla.nombres,
          apellidos: semilla.apellidos,
          cedula_identidad: semilla.cedula,
          fecha_nacimiento: semilla.fechaNacimiento,
          sexo: semilla.sexo,
          tipo_sangre: semilla.tipoSangre,
          direccion: semilla.direccion,
          departamento: "Oruro",
          municipio: semilla.municipio,
          terminos_version: "1.0",
          terminos_aceptados_at: new Date(),
        },
        { transaction },
      );
      await db.models.contactoEmergencia.create(
        {
          usuario_id: ciudadano.id,
          nombre_completo: semilla.contacto.nombre,
          parentesco: semilla.contacto.parentesco,
          telefono: semilla.contacto.telefono,
          es_principal: true,
          activo: true,
        },
        { transaction },
      );
      await transaction.commit();
      creados.set(semilla.email, Number(ciudadano.id));
      console.log(`[seed] ciudadano creado: ${semilla.email}`);
    } catch (error) {
      await transaction.rollback();
      console.error(`[seed] no se pudo crear ${semilla.email}:`, error);
    }
  }

  return creados;
};

const asegurarEmergencias = async (
  ciudadanosPorEmail: Map<string, number>,
  personalPorEmail: Map<string, string>,
): Promise<void> => {
  const db = Database.getInstance();
  const operadorId = personalPorEmail.get("operador1@168.bo") || null;

  for (const [indice, semilla] of emergencias.entries()) {
    const ciudadanoId = ciudadanosPorEmail.get(semilla.emailCiudadano);
    if (!ciudadanoId) continue;

    const idempotencyKey = `00000000-0000-4000-8000-${String(indice + 1).padStart(12, "0")}`;
    const existente = await db.models.emergencia.findOne({
      where: { usuario_id: ciudadanoId, idempotency_key: idempotencyKey },
    });
    if (existente) continue;

    const tipo = await db.models.tipoEmergencia.findOne({
      where: { codigo: semilla.tipo },
    });
    const estadoInicial = await db.models.estadoEmergencia.findOne({
      where: { codigo: "REPORTADA" },
    });
    const estadoFinal = await db.models.estadoEmergencia.findOne({
      where: { codigo: semilla.estado },
    });
    if (!tipo || !estadoInicial || !estadoFinal) {
      console.error(
        `[seed] catalogos incompletos para la emergencia ${semilla.tipo}/${semilla.estado}`,
      );
      continue;
    }

    const transaction = await db.sequelize.transaction();
    try {
      const emergencia = await db.models.emergencia.create(
        {
          uuid: crypto.randomUUID(),
          codigo_publico: `TMP-${crypto.randomUUID()}`,
          idempotency_key: idempotencyKey,
          usuario_id: ciudadanoId,
          tipo_emergencia_id: tipo.id,
          estado_id: estadoFinal.id,
          operador_id: estadoFinal.codigo === "REPORTADA" ? null : operadorId,
          gravedad: semilla.gravedad,
          puntaje_triage: puntajeTriage(semilla.gravedad, semilla.triage),
          descripcion: semilla.descripcion,
          latitud: semilla.latitud,
          longitud: semilla.longitud,
          precision_metros: 15,
          direccion_referencia: semilla.direccion,
          ubicacion_confirmada: true,
          puede_hablar: semilla.puedeHablar,
          metadata: { flow: "guided", origen: "seed" },
          reportada_at: new Date(),
          finalizada_at: estadoFinal.es_final ? new Date() : null,
        },
        { transaction },
      );
      await emergencia.update(
        {
          codigo_publico: `EMG-${new Date().getFullYear()}-${String(emergencia.id).padStart(6, "0")}`,
        },
        { transaction },
      );

      for (const [codigo, texto] of preguntasTriage) {
        await db.models.respuestaTriage.create(
          {
            emergencia_id: emergencia.id,
            pregunta_codigo: codigo,
            pregunta_texto: texto,
            opcion_codigo: semilla.triage[codigo],
            respuesta_texto: semilla.triage[codigo],
            peso_aplicado: 0,
          },
          { transaction },
        );
      }

      await db.models.historialEmergencia.create(
        {
          emergencia_id: emergencia.id,
          estado_anterior_id: null,
          estado_nuevo_id: estadoInicial.id,
          actor_usuario_id: ciudadanoId,
          observacion: "Emergencia reportada desde la aplicacion movil",
          latitud: semilla.latitud,
          longitud: semilla.longitud,
        },
        { transaction },
      );
      if (estadoFinal.id !== estadoInicial.id) {
        await db.models.historialEmergencia.create(
          {
            emergencia_id: emergencia.id,
            estado_anterior_id: estadoInicial.id,
            estado_nuevo_id: estadoFinal.id,
            actor_admin_id: operadorId,
            observacion: `Actualizado a ${estadoFinal.nombre} desde administracion`,
          },
          { transaction },
        );
      }

      await db.models.evidenciaEmergencia.create(
        {
          uuid: crypto.randomUUID(),
          emergencia_id: emergencia.id,
          tipo: "NOTA",
          contenido: semilla.nota,
        },
        { transaction },
      );

      await transaction.commit();
      console.log(
        `[seed] emergencia creada: ${semilla.tipo} / ${semilla.estado}`,
      );
    } catch (error) {
      await transaction.rollback();
      console.error(
        `[seed] no se pudo crear la emergencia ${semilla.tipo}:`,
        error,
      );
    }
  }
};

/**
 * Carga de datos operativos para desarrollo: personal administrativo, cuentas
 * de ciudadano y emergencias de ejemplo en distintos estados. Es idempotente:
 * cada registro se identifica por correo o por idempotency_key.
 */
export const ejecutarSeedOperaciones = async (): Promise<void> => {
  const personalPorEmail = await asegurarPersonal();
  const ciudadanosPorEmail = await asegurarCiudadanos();
  await asegurarEmergencias(ciudadanosPorEmail, personalPorEmail);
  console.log("[seed] datos operativos verificados");
};
