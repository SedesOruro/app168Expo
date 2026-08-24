import { Database } from "../../../../config/database";
import { RespuestaTriageRepositorySQL } from "./_sql/RespuestaTriageRepositorySQL";

export const RespuestaTriageRepository = new RespuestaTriageRepositorySQL(Database.getInstance().models.respuestaTriage);
