import { Database } from "../../../../config/database";
import { CiudadanoRepositorySQL } from "./_sql/CiudadanoRepositorySQL";

export const CiudadanoRepository = new CiudadanoRepositorySQL(
  Database.getInstance().models.ciudadano,
);
