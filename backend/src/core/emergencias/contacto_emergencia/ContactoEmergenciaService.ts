import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import { ContactoEmergenciaEntity, ContactoEmergenciaProps } from "./ContactoEmergenciaEntity";
import { IContactoEmergenciaRepository } from "./infra/IContactoEmergenciaRepository";

export class ContactoEmergenciaService extends BaseService<ContactoEmergenciaEntity, ContactoEmergenciaProps> {
  public constructor(repo: IContactoEmergenciaRepository) { super(repo); }
  factory(props: ContactoEmergenciaProps, id?: string): Promise<Result<ContactoEmergenciaEntity>> {
    return Promise.resolve(ContactoEmergenciaEntity.create(props, id));
  }
}
