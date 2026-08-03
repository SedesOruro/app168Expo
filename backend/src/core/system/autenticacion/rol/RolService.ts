import { BaseService } from "../../../../base/BaseService";
import { Result } from "../../../../base/Result";
import { RolEntity, RolProps } from "./RolEntity";

export class RolService extends BaseService<RolEntity, RolProps> {
  async factory(props: RolProps, id?: string): Promise<Result<RolEntity>> {
    return RolEntity.create(props, id);
  }
}
