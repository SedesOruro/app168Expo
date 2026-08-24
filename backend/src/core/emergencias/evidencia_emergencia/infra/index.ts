import { Database } from "../../../../config/database";
import { EvidenciaEmergenciaRepositorySQL } from "./_sql/EvidenciaEmergenciaRepositorySQL";

export const EvidenciaEmergenciaRepository = new EvidenciaEmergenciaRepositorySQL(Database.getInstance().models.evidenciaEmergencia);
