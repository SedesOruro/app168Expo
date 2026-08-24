import { Database } from "../../../../config/database";
import { EmergenciaRepositorySQL } from "./_sql/EmergenciaRepositorySQL";

export const EmergenciaRepository = new EmergenciaRepositorySQL(
  Database.getInstance().models.emergencia,
);
