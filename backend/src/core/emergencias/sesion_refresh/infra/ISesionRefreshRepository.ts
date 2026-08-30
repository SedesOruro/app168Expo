import { IRepository } from "../../../../base/infra/IRepository";
import { Result } from "../../../../base/types/Result";
import { SesionRefreshEntity } from "../SesionRefreshEntity";

export type DatosSesion = {
  ciudadanoId: number;
  jti: string;
  tokenHash: string;
  dispositivo: string | null;
  ipOrigen: string | null;
  expiraAt: Date;
};

export type CuentaDeSesion = {
  id: number;
  uuid: string;
  email: string;
  estado: string;
};

export interface ISesionRefreshRepository
  extends IRepository<SesionRefreshEntity> {
  crear(datos: DatosSesion): Promise<Result<boolean>>;
  /**
   * Rotacion atomica: valida el refresh vigente con lock, crea el reemplazo y
   * revoca el anterior enlazandolo al nuevo jti.
   */
  rotar(
    hashActual: string,
    nueva: Omit<DatosSesion, "ciudadanoId">,
  ): Promise<Result<CuentaDeSesion | null>>;
  revocarPorHash(hash: string): Promise<Result<boolean>>;
}
