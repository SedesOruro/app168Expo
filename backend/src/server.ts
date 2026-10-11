import { createApp } from "./app";
import { Database } from "./config/database";
import { env } from "./config/env";

const start = async (): Promise<void> => {
  const db = Database.getInstance();
  await db.authenticate();

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
