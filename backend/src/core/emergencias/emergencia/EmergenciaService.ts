import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import { EmergenciaEntity, EmergenciaProps } from "./EmergenciaEntity";
import { IEmergenciaRepository } from "./infra/IEmergenciaRepository";

export class EmergenciaService extends BaseService<
  EmergenciaEntity,
  EmergenciaProps
> {
  public constructor(repo: IEmergenciaRepository) {
    super(repo);
  }

  factory(
    props: EmergenciaProps,
    id?: string,
  ): Promise<Result<EmergenciaEntity>> {
    return Promise.resolve(EmergenciaEntity.create(props, id));
  }
}
