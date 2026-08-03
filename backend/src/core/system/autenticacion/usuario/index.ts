import { UsuarioService } from "./UsuarioService";
import { UsuarioRepository } from "./infra";

const service = new UsuarioService(UsuarioRepository);

export default service;
