import express from "express";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import { routes } from "./api/routes";
import { errorHandler } from "./middlewares/errorHandler";

export const createApp = () => {
  const app = express();

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
