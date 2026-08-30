import { Router } from "express";
import {
  checkIfAuthenticated,
  checkIfAdmin,
} from "../../../../../middlewares/authMiddleware";
import { RolViewController } from "./RolViewController";

const controller = new RolViewController();

const router = Router();

router.get("/roles_tabla", checkIfAdmin, (req, res) =>
  controller.obtenerTablaRoles(req, res),
);
router.get("/rol_formulario/:rol_id", checkIfAdmin, (req, res) =>
  controller.obtenerDatosFormularioRol(req, res),
);
router.post("/rol_formulario", checkIfAdmin, (req, res) =>
  controller.crearOActualizarRol(req, res),
);
router.get("/roles", checkIfAuthenticated, (req, res) =>
  controller.obtenerTodosRoles(req, res),
);
router.delete("/roles_tabla/:rol_id", checkIfAdmin, (req, res) =>
  controller.eliminarRol(req, res),
);

export default router;
