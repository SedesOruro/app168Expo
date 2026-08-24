import { HistorialEmergenciaRepository } from "./infra";
import { HistorialEmergenciaService } from "./HistorialEmergenciaService";

export default new HistorialEmergenciaService(HistorialEmergenciaRepository);
