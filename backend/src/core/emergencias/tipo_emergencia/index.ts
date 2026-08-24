import { TipoEmergenciaRepository } from "./infra";
import { TipoEmergenciaService } from "./TipoEmergenciaService";

export default new TipoEmergenciaService(TipoEmergenciaRepository);
