import { Database } from "../../../../config/database";
import { PerfilRepositorySQL } from "./_sql/PerfilRepositorySQL";

export const PerfilRepository = new PerfilRepositorySQL(Database.getInstance().models.perfil);
