import { QueryTypes, Sequelize } from "sequelize";

type ModuloMenu = {
  id: string;
  name: string;
  path: string;
  title: string;
};

/**
 * El rol `administrador` se creo sin los modulos de seguridad, por lo que el
 * panel no mostraba las secciones Usuarios y Roles aunque el backend pudiera
 * servirlas. Esta migracion agrega esos dos modulos al menu del rol.
 *
 * Es idempotente: solo agrega los modulos que falten y respeta cualquier otro
 * modulo ya configurado, asi que puede ejecutarse en cada arranque sin efecto.
 */
const MODULOS_SEGURIDAD: ModuloMenu[] = [
  { id: "usuarios", name: "usuarios", path: "/usuarios", title: "Usuarios" },
  { id: "roles", name: "roles", path: "/roles", title: "Roles" },
];

const ROL_OBJETIVO = "administrador";

export const habilitarModulosAdministrador = async (
  sequelize: Sequelize,
): Promise<void> => {
  const filas = await sequelize.query<{ id: string; modulos: unknown }>(
    "SELECT id, modulos FROM `rol` WHERE `tipo` = :tipo AND `fecha_eliminacion` IS NULL",
    { type: QueryTypes.SELECT, replacements: { tipo: ROL_OBJETIVO } },
  );
  if (filas.length === 0) return;

  for (const fila of filas) {
    const actuales = normalizarModulos(fila.modulos);
    const faltantes = MODULOS_SEGURIDAD.filter(
      (modulo) => !actuales.some((existente) => existente.id === modulo.id),
    );
    if (faltantes.length === 0) continue;

    const combinados = [...actuales, ...faltantes];
    await sequelize.query(
      "UPDATE `rol` SET `modulos` = :modulos WHERE `id` = :id",
      {
        type: QueryTypes.UPDATE,
        replacements: { modulos: JSON.stringify(combinados), id: fila.id },
      },
    );
    console.log(
      `[migracion] rol ${ROL_OBJETIVO}: modulos agregados -> ${faltantes
        .map((modulo) => modulo.id)
        .join(", ")}`,
    );
  }
};

const normalizarModulos = (valor: unknown): ModuloMenu[] => {
  if (Array.isArray(valor)) return valor as ModuloMenu[];
  if (typeof valor === "string") {
    try {
      const parseado = JSON.parse(valor);
      return Array.isArray(parseado) ? (parseado as ModuloMenu[]) : [];
    } catch {
      return [];
    }
  }
  return [];
};
