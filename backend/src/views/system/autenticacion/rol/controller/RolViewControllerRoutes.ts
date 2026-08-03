import { Router } from "express";
import {
  checkIfAuthenticated,
  checkIfSuperAdmin,
} from "../../../../../middlewares/authMiddleware";
import { RolViewController } from "./RolViewController";

const controller = new RolViewController();

const router = Router();

router.get("/roles_tabla", checkIfSuperAdmin, (req, res) =>
  controller.obtenerTablaRoles(req, res),
);
router.get("/rol_formulario/:rol_id", checkIfSuperAdmin, (req, res) =>
  controller.obtenerDatosFormularioRol(req, res),
);
router.post("/rol_formulario", checkIfSuperAdmin, (req, res) =>
  controller.crearOActualizarRol(req, res),
);
router.get("/roles", checkIfAuthenticated, (req, res) =>
  controller.obtenerTodosRoles(req, res),
);
router.delete("/roles_tabla/:rol_id", checkIfSuperAdmin, (req, res) =>
  controller.eliminarRol(req, res),
);

export default router;
