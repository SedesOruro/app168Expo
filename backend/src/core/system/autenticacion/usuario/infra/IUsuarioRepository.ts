import { IRepository } from "../../../../../base/infra/IRepository";
import { Result } from "../../../../../base/types/Result";
import { UsuarioEntity } from "../UsuarioEntity";

export type OperadorDisponible = {
  id: string;
  fullname: string;
  nombre: string;
  celular: string;
};

export interface IUsuarioRepository extends IRepository<UsuarioEntity> {
  listarOperadoresActivos(): Promise<Result<OperadorDisponible[]>>;
  estaActivo(id: string): Promise<Result<boolean>>;
}
