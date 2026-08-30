import { IRepository } from "../../../../base/infra/IRepository";
import { Result } from "../../../../base/types/Result";
import { EvidenciaEmergenciaEntity } from "../EvidenciaEmergenciaEntity";

export type TipoEvidencia = "NOTA" | "FOTO" | "AUDIO";

export type NuevaEvidencia = {
  emergenciaUuid: string;
  ciudadanoId: number;
  tipo: TipoEvidencia;
  contenido?: string | null;
  archivoUrl?: string | null;
  mimeType?: string | null;
  duracionSegundos?: number | null;
};

export interface IEvidenciaEmergenciaRepository
  extends IRepository<EvidenciaEmergenciaEntity> {
  /** Registra la evidencia validando que la emergencia sea del ciudadano. */
  registrarParaCiudadano(
    datos: NuevaEvidencia,
  ): Promise<Result<Record<string, unknown> | null>>;
}
