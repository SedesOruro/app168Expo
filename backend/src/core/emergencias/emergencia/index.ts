import { EmergenciaRepository } from "./infra";
import { EmergenciaService } from "./EmergenciaService";

export default new EmergenciaService(EmergenciaRepository);
