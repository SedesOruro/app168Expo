import { Router } from "express";
import { checkIfCiudadanoAuthenticated } from "../../../../middlewares/ciudadanoAuthMiddleware";
import { AutenticacionCiudadanoViewController } from "./AutenticacionCiudadanoViewController";

export const autenticacionCiudadanoRoutes = Router();
const controller = new AutenticacionCiudadanoViewController();

autenticacionCiudadanoRoutes.post("/register", (req, res, next) =>
  controller.registrar(req, res).catch(next),
);
autenticacionCiudadanoRoutes.post("/login", (req, res, next) =>
  controller.iniciarSesion(req, res).catch(next),
);
autenticacionCiudadanoRoutes.post("/refresh", (req, res, next) =>
  controller.refrescar(req, res).catch(next),
);
autenticacionCiudadanoRoutes.post("/logout", (req, res, next) =>
  controller.cerrarSesion(req, res).catch(next),
);
autenticacionCiudadanoRoutes.get(
  "/me",
  checkIfCiudadanoAuthenticated,
  (req, res, next) => controller.obtenerCuenta(req, res).catch(next),
);
autenticacionCiudadanoRoutes.post(
  "/change-password",
  checkIfCiudadanoAuthenticated,
  (req, res, next) => controller.cambiarPassword(req, res).catch(next),
);

export default autenticacionCiudadanoRoutes;
