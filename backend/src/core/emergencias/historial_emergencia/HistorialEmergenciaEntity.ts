import { Entity } from "../../../base/domain/Entity";
import { Result } from "../../../base/types/Result";

export type HistorialEmergenciaProps = Record<string, unknown>;

export class HistorialEmergenciaEntity extends Entity<HistorialEmergenciaProps> {
  private constructor(props: HistorialEmergenciaProps, id?: string) {
    super(props, id);
  }

  static create(props: HistorialEmergenciaProps, id?: string): Result<HistorialEmergenciaEntity> {
    return Result.ok(new HistorialEmergenciaEntity(props, id));
  }
}
