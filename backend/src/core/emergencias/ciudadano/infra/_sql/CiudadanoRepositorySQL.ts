import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { CiudadanoEntity } from "../../CiudadanoEntity";
import { ICiudadanoRepository } from "../ICiudadanoRepository";

type CiudadanoSQLModelData = {
  id: number;
  uuid: string;
  email: string;
  telefono?: string | null;
  password_hash: string;
  rol: "CIUDADANO";
  estado: "ACTIVO" | "INACTIVO";
  ultimo_acceso_at?: Date | null;
};

export class CiudadanoRepositorySQL
  extends BaseSQLRepository<CiudadanoEntity, CiudadanoSQLModelData>
  implements ICiudadanoRepository
{
  protected searchableFields(): string[] {
    return ["email", "telefono"];
  }

  fromSQLModelData(
    data: CiudadanoSQLModelData,
    id: string,
  ): Result<CiudadanoEntity> {
    return CiudadanoEntity.create(
      {
        uuid: data.uuid,
        email: data.email,
        telefono: data.telefono,
        passwordHash: data.password_hash,
        rol: "CIUDADANO",
        estado: data.estado,
        ultimoAccesoAt: data.ultimo_acceso_at,
      },
      id,
    );
  }

  toSQLModelData(entity: CiudadanoEntity): CiudadanoSQLModelData {
    return {
      id: Number(entity.id),
      uuid: entity.props.uuid,
      email: entity.props.email,
      telefono: entity.props.telefono,
      password_hash: entity.props.passwordHash,
      rol: entity.props.rol,
      estado: entity.props.estado,
      ultimo_acceso_at: entity.props.ultimoAccesoAt,
    };
  }
}
