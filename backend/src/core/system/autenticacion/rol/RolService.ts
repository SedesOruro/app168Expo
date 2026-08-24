import { BaseService } from "../../../../base/domain/BaseService";
import { Result } from "../../../../base/types/Result";
import { RolEntity, RolProps } from "./RolEntity";

export class RolService extends BaseService<RolEntity, RolProps> {
  async factory(props: RolProps, id?: string): Promise<Result<RolEntity>> {
    return RolEntity.create(props, id);
  }
}
