import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import { RespuestaTriageEntity, RespuestaTriageProps } from "./RespuestaTriageEntity";
import { IRespuestaTriageRepository } from "./infra/IRespuestaTriageRepository";

export class RespuestaTriageService extends BaseService<RespuestaTriageEntity, RespuestaTriageProps> {
  public constructor(repo: IRespuestaTriageRepository) { super(repo); }
  factory(props: RespuestaTriageProps, id?: string): Promise<Result<RespuestaTriageEntity>> {
    return Promise.resolve(RespuestaTriageEntity.create(props, id));
  }
}
