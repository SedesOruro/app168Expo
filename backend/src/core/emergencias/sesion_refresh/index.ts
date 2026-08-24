import { SesionRefreshRepository } from "./infra";
import { SesionRefreshService } from "./SesionRefreshService";

export default new SesionRefreshService(SesionRefreshRepository);
