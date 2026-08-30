import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import { EmergenciaEntity, EmergenciaProps } from "./EmergenciaEntity";
import {
  CambioOperativo,
  EmergenciaConRelaciones,
  EmergenciaListadoQuery,
  EntradaHistorial,
  EstadoActual,
  IEmergenciaRepository,
  ListadoEmergencias,
  NuevaEmergencia,
} from "./infra/IEmergenciaRepository";

export class EmergenciaService extends BaseService<
  EmergenciaEntity,
  EmergenciaProps
> {
  public constructor(protected readonly repo: IEmergenciaRepository) {
    super(repo);
  }

  factory(
    props: EmergenciaProps,
    id?: string,
  ): Promise<Result<EmergenciaEntity>> {
    return Promise.resolve(EmergenciaEntity.create(props, id));
  }

  contarTodas(): Promise<Result<number>> {
    return this.repo.contarTodas();
  }

  contarActivas(): Promise<Result<number>> {
    return this.repo.contarActivas();
  }

  listarConRelaciones(
    query: EmergenciaListadoQuery,
  ): Promise<Result<ListadoEmergencias>> {
    return this.repo.listarConRelaciones(query);
  }

  obtenerDetallePorUuid(
    uuid: string,
  ): Promise<Result<EmergenciaConRelaciones | null>> {
    return this.repo.obtenerDetallePorUuid(uuid);
  }

  listarPorCiudadano(
    ciudadanoId: number,
  ): Promise<Result<EmergenciaConRelaciones[]>> {
    return this.repo.listarPorCiudadano(ciudadanoId);
  }

  obtenerDetalleDeCiudadano(
    uuid: string,
    ciudadanoId: number,
  ): Promise<Result<EmergenciaConRelaciones | null>> {
    return this.repo.obtenerDetalleDeCiudadano(uuid, ciudadanoId);
  }

  buscarPorIdempotencia(
    ciudadanoId: number,
    idempotencyKey: string,
  ): Promise<Result<EmergenciaConRelaciones | null>> {
    return this.repo.buscarPorIdempotencia(ciudadanoId, idempotencyKey);
  }

  obtenerEstadoActual(uuid: string): Promise<Result<EstadoActual | null>> {
    return this.repo.obtenerEstadoActual(uuid);
  }

  registrarNueva(datos: NuevaEmergencia): Promise<Result<string>> {
    return this.repo.registrarNueva(datos);
  }

  /**
   * Regla de negocio: una emergencia con estado final no puede reabrirse.
   * La decision vive aqui; la escritura atomica la resuelve el repositorio.
   */
  async cambiarEstadoOperativo(
    uuid: string,
    estadoActual: EstadoActual,
    nuevoEstado: { id: number; esFinal: boolean } | null,
    operadorId: string | null | undefined,
    observacion: string,
    actorAdminId?: string | null,
  ): Promise<Result<boolean>> {
    const cambios: CambioOperativo = {};
    let historial: EntradaHistorial | null = null;

    if (nuevoEstado) {
      if (estadoActual.estadoEsFinal && estadoActual.estadoId !== nuevoEstado.id)
        return Result.conflicto<boolean>(
          "Una emergencia finalizada no puede reabrirse",
        );
      cambios.estadoId = nuevoEstado.id;
      if (nuevoEstado.esFinal) cambios.finalizadaAt = new Date();
      if (estadoActual.estadoId !== nuevoEstado.id) {
        historial = {
          estadoAnteriorId: estadoActual.estadoId,
          estadoNuevoId: nuevoEstado.id,
          actorAdminId: actorAdminId ?? null,
          observacion,
        };
      }
    }
    if (operadorId !== undefined) cambios.operadorId = operadorId;

    return this.repo.aplicarCambioOperativo(uuid, cambios, historial);
  }

  /** Puntaje de triage calculado en servidor, nunca confiando en el cliente. */
  static calcularPuntajeTriage(
    gravedad: string,
    triage: Record<string, string>,
  ): number {
    return (
      (gravedad === "ALTA" ? 30 : gravedad === "MEDIA" ? 15 : 0) +
      (triage.breathing === "NO" ? 50 : 0) +
      (triage.conscious === "NO" ? 30 : 0) +
      (triage.danger === "SI" ? 20 : 0)
    );
  }
}
