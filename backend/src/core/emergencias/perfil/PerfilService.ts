import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import { PerfilEntity, PerfilProps } from "./PerfilEntity";
import { IPerfilRepository } from "./infra/IPerfilRepository";

export class PerfilService extends BaseService<PerfilEntity, PerfilProps> {
  public constructor(repo: IPerfilRepository) { super(repo); }
  factory(props: PerfilProps, id?: string): Promise<Result<PerfilEntity>> {
    return Promise.resolve(PerfilEntity.create(props, id));
  }
}
