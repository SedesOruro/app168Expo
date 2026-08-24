import { CiudadanoRepository } from "./infra";
import { CiudadanoService } from "./CiudadanoService";

export default new CiudadanoService(CiudadanoRepository);
