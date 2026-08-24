import { Entity } from "../../../base/domain/Entity";
import { Result } from "../../../base/types/Result";

export type EvidenciaEmergenciaProps = Record<string, unknown>;

export class EvidenciaEmergenciaEntity extends Entity<EvidenciaEmergenciaProps> {
  private constructor(props: EvidenciaEmergenciaProps, id?: string) {
    super(props, id);
  }

  static create(props: EvidenciaEmergenciaProps, id?: string): Result<EvidenciaEmergenciaEntity> {
    return Result.ok(new EvidenciaEmergenciaEntity(props, id));
  }
}
