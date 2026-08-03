import { Router } from "express";
import { storageRoutes } from "../storage/storage.routes";
import usuarioRouter from "../views/system/autenticacion/usuario/controller/UsuarioViewControllerRoutes";
import rolRouter from "../views/system/autenticacion/rol/controller/RolViewControllerRoutes";
import { citizenAuthRoutes } from "../modules/emergencias/auth.routes";
import { citizenRoutes } from "../modules/emergencias/citizen.routes";
import { emergencyAdminRoutes } from "../modules/emergencias/admin.routes";

export const routes = Router();

routes.use("/usuarios", usuarioRouter);
routes.use("/roles", rolRouter);
routes.use("/storage", storageRoutes);
routes.use("/auth", citizenAuthRoutes);
routes.use("/mobile", citizenRoutes);
routes.use("/operations", emergencyAdminRoutes);
