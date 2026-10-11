import { Router } from "express";
import multer from "multer";
import { checkIfCiudadanoAuthenticated } from "../../../../middlewares/ciudadanoAuthMiddleware";
import { CiudadanoViewController } from "./CiudadanoViewController";

export const ciudadanoRoutes = Router();
const controller = new CiudadanoViewController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

ciudadanoRoutes.use(checkIfCiudadanoAuthenticated);

ciudadanoRoutes.post("/uploads", upload.single("file"), (req, res, next) =>
  controller.subirArchivo(req, res).catch(next),
);

ciudadanoRoutes.get("/catalogs/emergency-types", (req, res, next) =>
  controller.listarTiposEmergencia(req, res).catch(next),
);

ciudadanoRoutes.get("/health-centers", (req, res, next) =>
  controller.listarCentrosCercanos(req, res).catch(next),
);

ciudadanoRoutes.get("/profile", (req, res, next) =>
  controller.obtenerPerfil(req, res).catch(next),
);
ciudadanoRoutes.put("/profile", (req, res, next) =>
  controller.actualizarPerfil(req, res).catch(next),
);

ciudadanoRoutes.post("/emergencies", (req, res, next) =>
  controller.crearEmergencia(req, res).catch(next),
);
ciudadanoRoutes.get("/emergencies", (req, res, next) =>
  controller.listarEmergencias(req, res).catch(next),
);
ciudadanoRoutes.get("/emergencies/:uuid", (req, res, next) =>
  controller.obtenerEmergencia(req, res).catch(next),
);
ciudadanoRoutes.patch("/emergencies/:uuid/triage", (req, res, next) =>
  controller.completarTriage(req, res).catch(next),
);
ciudadanoRoutes.post("/emergencies/:uuid/evidence", (req, res, next) =>
  controller.registrarEvidencia(req, res).catch(next),
);

export default ciudadanoRoutes;
