import { Database } from "../config/database";
import { migrarCiudadanosLegado } from "../migrations/migrarCiudadanosLegado";
import { repuntarClavesForaneasCiudadanos } from "../migrations/repuntarClavesForaneasCiudadanos";
import { ensureSecuritySeed } from "./securitySeed";
import { ejecutarSeedOperaciones } from "./operacionesSeed";

const run = async (): Promise<void> => {
  const db = Database.getInstance();
  await db.authenticate();
  await db.sync();
  await migrarCiudadanosLegado(db.sequelize);
  await repuntarClavesForaneasCiudadanos(db.sequelize);
  await ensureSecuritySeed();
  await ejecutarSeedOperaciones();
  await db.sequelize.close();
};

run().catch(async (error) => {
  console.error("[seed] fallo la carga de datos operativos", error);
  process.exit(1);
});
