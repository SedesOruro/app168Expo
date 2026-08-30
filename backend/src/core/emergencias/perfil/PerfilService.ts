import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import { PerfilEntity, PerfilProps } from "./PerfilEntity";
import {
  CambioPerfil,
  IPerfilRepository,
  PerfilCompleto,
} from "./infra/IPerfilRepository";

/** Campos del perfil que el ciudadano puede editar desde la app movil. */
const CAMPOS_EDITABLES = [
  "nombres",
  "apellidos",
  "fecha_nacimiento",
  "sexo",
  "tipo_sangre",
  "direccion",
  "departamento",
  "municipio",
  "alergias",
  "enfermedades_cronicas",
  "medicamentos_actuales",
  "condiciones_relevantes",
  "seguro_medico",
  "numero_seguro",
];

export class PerfilService extends BaseService<PerfilEntity, PerfilProps> {
  public constructor(protected readonly repo: IPerfilRepository) {
    super(repo);
  }

  factory(props: PerfilProps, id?: string): Promise<Result<PerfilEntity>> {
    return Promise.resolve(PerfilEntity.create(props, id));
  }

  obtenerPerfilCompleto(
    ciudadanoId: number,
  ): Promise<Result<PerfilCompleto | null>> {
    return this.repo.obtenerPerfilCompleto(ciudadanoId);
  }

  guardarPerfilCompleto(
    ciudadanoId: number,
    cambio: CambioPerfil,
  ): Promise<Result<boolean>> {
    return this.repo.guardarPerfilCompleto(ciudadanoId, cambio);
  }

  static camposEditables(): string[] {
    return CAMPOS_EDITABLES;
  }
}
