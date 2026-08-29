import { QueryTypes, Sequelize } from "sequelize";

type ClaveForanea = {
  tabla: string;
  columna: string;
  constraint: string;
  onDelete: "CASCADE" | "RESTRICT" | "SET NULL";
};

/**
 * El esquema original guardaba las cuentas de ciudadano en `usuarios`. El
 * backend migro esas cuentas a `ciudadanos` (ver migrarCiudadanosLegado), pero
 * las claves foraneas fisicas siguieron apuntando a la tabla legada, por lo que
 * cualquier alta de perfil, contacto, sesion o emergencia fallaba con
 * "foreign key constraint fails".
 */
const clavesForaneas: ClaveForanea[] = [
  { tabla: "perfiles", columna: "usuario_id", constraint: "fk_perfiles_usuario", onDelete: "CASCADE" },
  { tabla: "contactos_emergencia", columna: "usuario_id", constraint: "fk_contactos_usuario", onDelete: "CASCADE" },
  { tabla: "sesiones_refresh", columna: "usuario_id", constraint: "fk_sesiones_refresh_usuario", onDelete: "CASCADE" },
  { tabla: "emergencias", columna: "usuario_id", constraint: "fk_emergencias_usuario", onDelete: "RESTRICT" },
  { tabla: "historial_emergencia", columna: "actor_usuario_id", constraint: "fk_historial_actor", onDelete: "SET NULL" },
];

const tablaExiste = async (
  sequelize: Sequelize,
  tabla: string,
): Promise<boolean> => {
  const filas = await sequelize.query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = :tabla`,
    { type: QueryTypes.SELECT, replacements: { tabla } },
  );
  return Number(filas[0]?.total || 0) > 0;
};

// Las vistas de information_schema exponen sus columnas en mayusculas, por lo
// que siempre se usa un alias explicito para leer el resultado sin ambiguedad.
const tablaReferenciada = async (
  sequelize: Sequelize,
  clave: ClaveForanea,
): Promise<string | null> => {
  const filas = await sequelize.query<{ referencia: string }>(
    `SELECT referenced_table_name AS referencia
     FROM information_schema.key_column_usage
     WHERE table_schema = DATABASE()
       AND table_name = :tabla
       AND constraint_name = :constraint
       AND referenced_table_name IS NOT NULL`,
    {
      type: QueryTypes.SELECT,
      replacements: { tabla: clave.tabla, constraint: clave.constraint },
    },
  );
  return filas[0]?.referencia || null;
};

const contarHuerfanos = async (
  sequelize: Sequelize,
  clave: ClaveForanea,
): Promise<number> => {
  const filas = await sequelize.query<{ total: number }>(
    `SELECT COUNT(*) AS total
     FROM \`${clave.tabla}\` hijo
     LEFT JOIN \`ciudadanos\` padre ON padre.\`id\` = hijo.\`${clave.columna}\`
     WHERE hijo.\`${clave.columna}\` IS NOT NULL AND padre.\`id\` IS NULL`,
    { type: QueryTypes.SELECT },
  );
  return Number(filas[0]?.total || 0);
};

const asegurarIndiceEstado = async (sequelize: Sequelize): Promise<void> => {
  const filas = await sequelize.query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name = 'ciudadanos'
       AND index_name = 'idx_ciudadanos_estado'`,
    { type: QueryTypes.SELECT },
  );
  if (Number(filas[0]?.total || 0) > 0) return;
  await sequelize.query(
    "CREATE INDEX `idx_ciudadanos_estado` ON `ciudadanos` (`estado`, `rol`)",
  );
  console.log("[migration] ciudadanos: indice idx_ciudadanos_estado creado");
};

export const repuntarClavesForaneasCiudadanos = async (
  sequelize: Sequelize,
): Promise<void> => {
  if (!(await tablaExiste(sequelize, "ciudadanos"))) return;

  let repuntadas = 0;
  for (const clave of clavesForaneas) {
    if (!(await tablaExiste(sequelize, clave.tabla))) continue;

    const referencia = await tablaReferenciada(sequelize, clave);
    if (referencia === "ciudadanos") continue;

    const huerfanos = await contarHuerfanos(sequelize, clave);
    if (huerfanos > 0) {
      console.error(
        `[migration] ${clave.tabla}.${clave.columna}: ${huerfanos} registros sin ciudadano asociado. ` +
          "Se omite el repunte de la clave foranea; depure esos registros y reinicie el servicio.",
      );
      continue;
    }

    if (referencia) {
      await sequelize.query(
        `ALTER TABLE \`${clave.tabla}\` DROP FOREIGN KEY \`${clave.constraint}\``,
      );
    }
    await sequelize.query(
      `ALTER TABLE \`${clave.tabla}\`
       ADD CONSTRAINT \`${clave.constraint}\`
       FOREIGN KEY (\`${clave.columna}\`) REFERENCES \`ciudadanos\` (\`id\`)
       ON DELETE ${clave.onDelete}`,
    );
    repuntadas += 1;
    console.log(
      `[migration] ${clave.tabla}.${clave.columna} ahora referencia ciudadanos(id)`,
    );
  }

  await asegurarIndiceEstado(sequelize);

  if (repuntadas > 0) {
    console.log(
      `[migration] ciudadanos: ${repuntadas} claves foraneas repuntadas desde el esquema legado`,
    );
  }
};
