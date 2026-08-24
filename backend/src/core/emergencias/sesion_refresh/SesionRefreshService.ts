import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import { SesionRefreshEntity, SesionRefreshProps } from "./SesionRefreshEntity";
import { ISesionRefreshRepository } from "./infra/ISesionRefreshRepository";

export class SesionRefreshService extends BaseService<SesionRefreshEntity, SesionRefreshProps> {
  public constructor(repo: ISesionRefreshRepository) { super(repo); }
  factory(props: SesionRefreshProps, id?: string): Promise<Result<SesionRefreshEntity>> {
    return Promise.resolve(SesionRefreshEntity.create(props, id));
  }
}
