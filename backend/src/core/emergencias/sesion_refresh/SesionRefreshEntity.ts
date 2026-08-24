import { Entity } from "../../../base/domain/Entity";
import { Result } from "../../../base/types/Result";

export type SesionRefreshProps = Record<string, unknown>;

export class SesionRefreshEntity extends Entity<SesionRefreshProps> {
  private constructor(props: SesionRefreshProps, id?: string) {
    super(props, id);
  }

  static create(props: SesionRefreshProps, id?: string): Result<SesionRefreshEntity> {
    return Result.ok(new SesionRefreshEntity(props, id));
  }
}
