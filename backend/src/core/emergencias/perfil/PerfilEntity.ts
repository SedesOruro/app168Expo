import { Entity } from "../../../base/domain/Entity";
import { Result } from "../../../base/types/Result";

export type PerfilProps = Record<string, unknown>;

export class PerfilEntity extends Entity<PerfilProps> {
  private constructor(props: PerfilProps, id?: string) {
    super(props, id);
  }

  static create(props: PerfilProps, id?: string): Result<PerfilEntity> {
    return Result.ok(new PerfilEntity(props, id));
  }
}
