import { Database } from "../../../../config/database";
import { EstadoEmergenciaRepositorySQL } from "./_sql/EstadoEmergenciaRepositorySQL";

export const EstadoEmergenciaRepository = new EstadoEmergenciaRepositorySQL(Database.getInstance().models.estadoEmergencia);
