import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import {
  EvidenciaEmergenciaEntity,
  EvidenciaEmergenciaProps,
} from "./EvidenciaEmergenciaEntity";
import {
  IEvidenciaEmergenciaRepository,
  NuevaEvidencia,
} from "./infra/IEvidenciaEmergenciaRepository";

export class EvidenciaEmergenciaService extends BaseService<
  EvidenciaEmergenciaEntity,
  EvidenciaEmergenciaProps
> {
  public constructor(protected readonly repo: IEvidenciaEmergenciaRepository) {
    super(repo);
  }

  factory(
    props: EvidenciaEmergenciaProps,
    id?: string,
  ): Promise<Result<EvidenciaEmergenciaEntity>> {
    return Promise.resolve(EvidenciaEmergenciaEntity.create(props, id));
  }

  /**
   * Valida el tipo y su carga util antes de registrar: una nota necesita texto,
   * una foto o audio necesitan archivo.
   */
  registrar(
    datos: NuevaEvidencia,
  ): Promise<Result<Record<string, unknown> | null>> {
    if (!["NOTA", "FOTO", "AUDIO"].includes(datos.tipo))
      return Promise.resolve(Result.fail("Tipo de evidencia no valido"));
    if (datos.tipo === "NOTA" && !String(datos.contenido || "").trim())
      return Promise.resolve(Result.fail("La nota no puede estar vacia"));
    if (datos.tipo !== "NOTA" && !String(datos.archivoUrl || "").trim())
      return Promise.resolve(
        Result.fail("El archivo de evidencia es requerido"),
      );
    return this.repo.registrarParaCiudadano(datos);
  }
}
