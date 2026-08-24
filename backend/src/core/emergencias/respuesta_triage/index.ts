import { RespuestaTriageRepository } from "./infra";
import { RespuestaTriageService } from "./RespuestaTriageService";

export default new RespuestaTriageService(RespuestaTriageRepository);
