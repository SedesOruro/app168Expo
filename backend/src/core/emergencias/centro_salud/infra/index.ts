import { Database } from "../../../../config/database";
import { CentroSaludRepositorySQL } from "./_sql/CentroSaludRepositorySQL";

export const CentroSaludRepository = new CentroSaludRepositorySQL(
  Database.getInstance().models.centroSalud,
);
