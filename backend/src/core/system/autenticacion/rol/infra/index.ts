import { Database } from "../../../../../config/database";
import { RolRepositorySQL } from "./_sql/RolRepositorySQL";

const db = Database.getInstance();

export const RolRepository = new RolRepositorySQL(db.models.rol);
