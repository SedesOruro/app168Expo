import { Database } from "../../../../../config/database";
import { UsuarioRepositorySQL } from "./_sql/UsuarioRepositorySQL";

const db = Database.getInstance();

export const UsuarioRepository = new UsuarioRepositorySQL(db.models.usuario);
