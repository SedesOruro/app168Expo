import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import { CiudadanoEntity, CiudadanoProps } from "./CiudadanoEntity";
import { ICiudadanoRepository } from "./infra/ICiudadanoRepository";

export class CiudadanoService extends BaseService<
  CiudadanoEntity,
  CiudadanoProps
> {
  public constructor(repo: ICiudadanoRepository) {
    super(repo);
  }

  factory(
    props: CiudadanoProps,
    id?: string,
  ): Promise<Result<CiudadanoEntity>> {
    return Promise.resolve(CiudadanoEntity.create(props, id));
  }

  async buscarPorCorreo(email: string): Promise<Result<CiudadanoEntity>> {
    const ciudadanos = await this.getAll({ email: email.trim().toLowerCase() });
    if (ciudadanos.isFailure) return Result.fail(ciudadanos.error || "Error al buscar ciudadano");
    const ciudadano = ciudadanos.getValue()[0];
    return ciudadano
      ? Result.ok(ciudadano)
      : Result.fail("Ciudadano no encontrado");
  }
}
