import { EvidenciaEmergenciaRepository } from "./infra";
import { EvidenciaEmergenciaService } from "./EvidenciaEmergenciaService";

export default new EvidenciaEmergenciaService(EvidenciaEmergenciaRepository);
