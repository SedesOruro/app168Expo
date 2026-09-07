import express from "express";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import { routes } from "./api/routes";
import { errorHandler } from "./middlewares/errorHandler";

export const createApp = () => {
  const app = express();

  // Detras de nginx todas las peticiones llegan desde 127.0.0.1. Sin esto, la IP
  // que se registra de cada emergencia es la del proxy y no la del ciudadano, y
  // req.protocol dice "http" aunque el navegador venga por HTTPS.
  if (env.nodeEnv === "production") app.set("trust proxy", 1);

  app.use(compression());
  app.use(
    cors({ origin: env.corsOrigin.includes("*") ? true : env.corsOrigin }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  if (env.httpLogging) {
    app.use(
      morgan("dev", { skip: (req) => req.method.toLowerCase() === "options" }),
    );
  }

  app.get("/", (_req, res) =>
    res.json({ msg: `Servicio activo en modo ${env.nodeEnv}` }),
  );
  app.use("/api", routes);
  app.use(errorHandler);

  return app;
};
