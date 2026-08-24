import { Entity } from "../../../base/domain/Entity";
import { Result } from "../../../base/types/Result";

export type ContactoEmergenciaProps = Record<string, unknown>;

export class ContactoEmergenciaEntity extends Entity<ContactoEmergenciaProps> {
  private constructor(props: ContactoEmergenciaProps, id?: string) {
    super(props, id);
  }

  static create(props: ContactoEmergenciaProps, id?: string): Result<ContactoEmergenciaEntity> {
    return Result.ok(new ContactoEmergenciaEntity(props, id));
  }
}
