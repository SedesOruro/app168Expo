import { Entity } from "../../../base/domain/Entity";
import { Result } from "../../../base/types/Result";

export type RespuestaTriageProps = Record<string, unknown>;

export class RespuestaTriageEntity extends Entity<RespuestaTriageProps> {
  private constructor(props: RespuestaTriageProps, id?: string) {
    super(props, id);
  }

  static create(props: RespuestaTriageProps, id?: string): Result<RespuestaTriageEntity> {
    return Result.ok(new RespuestaTriageEntity(props, id));
  }
}
