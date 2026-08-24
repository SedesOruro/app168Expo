import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import { CentroSaludEntity, CentroSaludProps } from "./CentroSaludEntity";
import { ICentroSaludRepository } from "./infra/ICentroSaludRepository";

export class CentroSaludService extends BaseService<
  CentroSaludEntity,
  CentroSaludProps
> {
  public constructor(repo: ICentroSaludRepository) {
    super(repo);
  }

  factory(
    props: CentroSaludProps,
    id?: string,
  ): Promise<Result<CentroSaludEntity>> {
    return Promise.resolve(CentroSaludEntity.create(props, id));
  }
}
