import { Router } from "express";
import {
  checkIfAdmin,
  checkIfOperationalStaff,
} from "../../../../middlewares/authMiddleware";
import { OperacionesEmergenciaViewController } from "./OperacionesEmergenciaViewController";

export const emergencyAdminRoutes = Router();
const controller = new OperacionesEmergenciaViewController();

emergencyAdminRoutes.use(checkIfOperationalStaff);

emergencyAdminRoutes.get("/dashboard", (req, res) =>
  controller.dashboard(req, res),
);

emergencyAdminRoutes.get("/emergencies", (req, res) =>
  controller.listarEmergencias(req, res),
);
emergencyAdminRoutes.get("/emergencies/:uuid", (req, res) =>
  controller.obtenerEmergencia(req, res),
);
emergencyAdminRoutes.patch("/emergencies/:uuid", (req, res) =>
  controller.actualizarEmergencia(req, res),
);

emergencyAdminRoutes.get("/statuses", (req, res) =>
  controller.listarEstados(req, res),
);
emergencyAdminRoutes.get("/operators", (req, res) =>
  controller.listarOperadores(req, res),
);

emergencyAdminRoutes.get("/citizens", (req, res) =>
  controller.listarCiudadanos(req, res),
);
emergencyAdminRoutes.patch("/citizens/:uuid/status", checkIfAdmin, (req, res) =>
  controller.cambiarEstadoCiudadano(req, res),
);

emergencyAdminRoutes.get("/health-centers", (req, res) =>
  controller.listarCentrosSalud(req, res),
);
emergencyAdminRoutes.post("/health-centers", checkIfAdmin, (req, res) =>
  controller.crearCentroSalud(req, res),
);
emergencyAdminRoutes.put("/health-centers/:uuid", checkIfAdmin, (req, res) =>
  controller.actualizarCentroSalud(req, res),
);
emergencyAdminRoutes.delete("/health-centers/:uuid", checkIfAdmin, (req, res) =>
  controller.desactivarCentroSalud(req, res),
);

export default emergencyAdminRoutes;
