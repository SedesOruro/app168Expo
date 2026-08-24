import { QueryTypes, Sequelize } from "sequelize";

type Column = { Field: string };

const columnasCiudadanoLegado = [
  "id",
  "uuid",
  "email",
  "telefono",
  "password_hash",
  "rol",
  "estado",
  "ultimo_acceso_at",
  "created_at",
  "updated_at",
  "deleted_at",
];

export const migrarCiudadanosLegado = async (
  sequelize: Sequelize,
): Promise<void> => {
  const tables = await sequelize.getQueryInterface().showAllTables();
  if (!tables.map(String).includes("usuarios")) return;

  const columns = await sequelize.query<Column>("SHOW COLUMNS FROM `usuarios`", {
    type: QueryTypes.SELECT,
  });
  const columnNames = new Set(columns.map((column) => column.Field));
  if (!columnasCiudadanoLegado.every((column) => columnNames.has(column))) return;

  const source = await sequelize.query<{ total: number }>(
    "SELECT COUNT(*) AS total FROM `usuarios` WHERE `password_hash` IS NOT NULL",
    { type: QueryTypes.SELECT },
  );
  if (!source[0]?.total) return;

  await sequelize.query(
    `INSERT INTO \`ciudadanos\` (
      \`id\`, \`uuid\`, \`email\`, \`telefono\`, \`password_hash\`, \`rol\`, \`estado\`,
      \`ultimo_acceso_at\`, \`created_at\`, \`updated_at\`, \`deleted_at\`
    )
    SELECT
      \`id\`, \`uuid\`, \`email\`, \`telefono\`, \`password_hash\`, \`rol\`, \`estado\`,
      \`ultimo_acceso_at\`, \`created_at\`, \`updated_at\`, \`deleted_at\`
    FROM \`usuarios\`
    WHERE \`password_hash\` IS NOT NULL
    ON DUPLICATE KEY UPDATE
      \`telefono\` = VALUES(\`telefono\`),
      \`password_hash\` = VALUES(\`password_hash\`),
      \`rol\` = VALUES(\`rol\`),
      \`estado\` = VALUES(\`estado\`),
      \`ultimo_acceso_at\` = VALUES(\`ultimo_acceso_at\`),
      \`updated_at\` = VALUES(\`updated_at\`),
      \`deleted_at\` = VALUES(\`deleted_at\`)`,
  );

  console.log(`[migration] ciudadanos: ${source[0].total} registros del esquema legado verificados`);
};
