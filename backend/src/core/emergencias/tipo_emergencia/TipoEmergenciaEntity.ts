import { Entity } from "../../../base/domain/Entity";
import { Result } from "../../../base/types/Result";

export type TipoEmergenciaProps = Record<string, unknown>;

export class TipoEmergenciaEntity extends Entity<TipoEmergenciaProps> {
  private constructor(props: TipoEmergenciaProps, id?: string) {
    super(props, id);
  }

  static create(props: TipoEmergenciaProps, id?: string): Result<TipoEmergenciaEntity> {
    return Result.ok(new TipoEmergenciaEntity(props, id));
  }
}
