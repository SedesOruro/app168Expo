import { Entity } from "../../../base/domain/Entity";
import { Result } from "../../../base/types/Result";

export type EstadoEmergenciaProps = Record<string, unknown>;

export class EstadoEmergenciaEntity extends Entity<EstadoEmergenciaProps> {
  private constructor(props: EstadoEmergenciaProps, id?: string) {
    super(props, id);
  }

  static create(props: EstadoEmergenciaProps, id?: string): Result<EstadoEmergenciaEntity> {
    return Result.ok(new EstadoEmergenciaEntity(props, id));
  }
}
