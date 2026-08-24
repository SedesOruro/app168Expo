import { Router } from "express";
import { storageRoutes } from "../storage/storage.routes";
import usuarioRouter from "../views/system/autenticacion/usuario/controller/UsuarioViewControllerRoutes";
import rolRouter from "../views/system/autenticacion/rol/controller/RolViewControllerRoutes";
import autenticacionCiudadanoRouter from "../views/emergencias/autenticacion/controller/AutenticacionCiudadanoControllerRoutes";
import ciudadanoRouter from "../views/emergencias/ciudadano/controller/CiudadanoControllerRoutes";
import operacionesEmergenciaRouter from "../views/emergencias/operaciones/controller/OperacionesEmergenciaControllerRoutes";

export const routes = Router();

routes.use("/usuarios", usuarioRouter);
routes.use("/roles", rolRouter);
routes.use("/storage", storageRoutes);
routes.use("/auth", autenticacionCiudadanoRouter);
routes.use("/mobile", ciudadanoRouter);
routes.use("/operations", operacionesEmergenciaRouter);
