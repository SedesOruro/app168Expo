import { Database } from "../../../../config/database";
import { TipoEmergenciaRepositorySQL } from "./_sql/TipoEmergenciaRepositorySQL";

export const TipoEmergenciaRepository = new TipoEmergenciaRepositorySQL(Database.getInstance().models.tipoEmergencia);
