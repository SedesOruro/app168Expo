import { Router } from "express";
import {
  checkIfAuthenticated,
  checkIfAdmin,
} from "../../../../../middlewares/authMiddleware";
import { UsuarioViewController } from "./UsuarioViewController";

const controller = new UsuarioViewController();

const router = Router();

router.post("/login", (req, res) => controller.login(req, res));
router.get("/sesion-info", checkIfAuthenticated, (req, res) =>
  controller.getSessionInfo(req, res),
);
router.get("/usuarios_tabla", checkIfAdmin, (req, res) =>
  controller.obtenerTablaUsuarios(req, res),
);
router.get("/usuario_formulario/:usuario_id", checkIfAdmin, (req, res) =>
  controller.obtenerDatosFormularioUsuario(req, res),
);
router.get("/usuarios", checkIfAuthenticated, (req, res) =>
  controller.obtenerTodosUsuarios(req, res),
);
router.post("/usuario_formulario", checkIfAdmin, (req, res) =>
  controller.crearUsuario(req, res),
);
router.put("/usuario_formulario", checkIfAdmin, (req, res) =>
  controller.actualizarUsuario(req, res),
);
router.delete("/usuarios_tabla/:usuario_id", checkIfAdmin, (req, res) =>
  controller.eliminarUsuario(req, res),
);
router.post("/usuarios_tabla/:usuario_id", checkIfAdmin, (req, res) =>
  controller.changeState(req, res),
);

export default router;
