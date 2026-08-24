import { PerfilRepository } from "./infra";
import { PerfilService } from "./PerfilService";

export default new PerfilService(PerfilRepository);
