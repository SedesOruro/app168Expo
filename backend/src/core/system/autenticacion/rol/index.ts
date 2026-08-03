import { RolService } from "./RolService";
import { RolRepository } from "./infra";

const service = new RolService(RolRepository);

export default service;
