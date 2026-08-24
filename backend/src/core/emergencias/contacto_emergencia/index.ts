import { ContactoEmergenciaRepository } from "./infra";
import { ContactoEmergenciaService } from "./ContactoEmergenciaService";

export default new ContactoEmergenciaService(ContactoEmergenciaRepository);
