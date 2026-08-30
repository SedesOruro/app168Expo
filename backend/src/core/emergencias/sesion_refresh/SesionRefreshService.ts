import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import {
  SesionRefreshEntity,
  SesionRefreshProps,
} from "./SesionRefreshEntity";
import {
  CuentaDeSesion,
  DatosSesion,
  ISesionRefreshRepository,
} from "./infra/ISesionRefreshRepository";

export class SesionRefreshService extends BaseService<
  SesionRefreshEntity,
  SesionRefreshProps
> {
  public constructor(protected readonly repo: ISesionRefreshRepository) {
    super(repo);
  }

  factory(
    props: SesionRefreshProps,
    id?: string,
  ): Promise<Result<SesionRefreshEntity>> {
    return Promise.resolve(SesionRefreshEntity.create(props, id));
  }

  crear(datos: DatosSesion): Promise<Result<boolean>> {
    return this.repo.crear(datos);
  }

  rotar(
    hashActual: string,
    nueva: Omit<DatosSesion, "ciudadanoId">,
  ): Promise<Result<CuentaDeSesion | null>> {
    return this.repo.rotar(hashActual, nueva);
  }

  revocarPorHash(hash: string): Promise<Result<boolean>> {
    return this.repo.revocarPorHash(hash);
  }
}
