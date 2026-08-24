import { Database } from "../../../../config/database";
import { ContactoEmergenciaRepositorySQL } from "./_sql/ContactoEmergenciaRepositorySQL";

export const ContactoEmergenciaRepository = new ContactoEmergenciaRepositorySQL(Database.getInstance().models.contactoEmergencia);
