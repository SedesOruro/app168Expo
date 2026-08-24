import { Database } from "../../../../config/database";
import { HistorialEmergenciaRepositorySQL } from "./_sql/HistorialEmergenciaRepositorySQL";

export const HistorialEmergenciaRepository = new HistorialEmergenciaRepositorySQL(Database.getInstance().models.historialEmergencia);
