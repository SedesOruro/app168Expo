import { createApp } from "./app";
import { Database } from "./config/database";
import { env } from "./config/env";
import { ensureSecuritySeed } from "./seeders/securitySeed";

const start = async (): Promise<void> => {
  const db = Database.getInstance();
  await db.authenticate();

  if (process.env.CREATE_DATABASE) {
    console.log("[database] sincronizando base de datos...");
    await db.sync(true);
    await ensureSecuritySeed();
    console.log("[database] tablas y seed inicial creados exitosamente");
    await db.sequelize.close();
    return;
  }

  await db.sync();
  await ensureSecuritySeed();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(
      `Servicio activo http://localhost:${env.port} en modo ${env.nodeEnv}`,
    );
  });
};

start().catch((error) => {
  console.error("[server] fallo al iniciar", error);
  process.exit(1);
});
