import { EstadoEmergenciaRepository } from "./infra";
import { EstadoEmergenciaService } from "./EstadoEmergenciaService";

export default new EstadoEmergenciaService(EstadoEmergenciaRepository);
