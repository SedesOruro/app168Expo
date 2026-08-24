import { CentroSaludRepository } from "./infra";
import { CentroSaludService } from "./CentroSaludService";

export default new CentroSaludService(CentroSaludRepository);
