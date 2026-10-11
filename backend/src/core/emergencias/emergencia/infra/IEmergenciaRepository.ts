import { IRepository } from "../../../../base/infra/IRepository";
import { Result } from "../../../../base/types/Result";
import { EmergenciaEntity } from "../EmergenciaEntity";

/**
 * Consultas propias del agregado. Se declaran aqui para que las vistas y los
 * controladores no necesiten Sequelize: toda construccion de query vive en la
 * implementacion `_sql`.
 */

export type EmergenciaListadoQuery = {
  limit: number;
  offset: number;
  q?: string;
  estadoId?: number;
};

/** Forma exacta que consumen el panel administrativo y la app movil. */
export type EmergenciaConRelaciones = Record<string, unknown>;

export type ListadoEmergencias = {
  rows: EmergenciaConRelaciones[];
  count: number;
};

export type CambioOperativo = {
  estadoId?: number;
  finalizadaAt?: Date | null;
  operadorId?: string | null;
};

export type EntradaHistorial = {
  estadoAnteriorId: number | null;
  estadoNuevoId: number;
  actorAdminId?: string | null;
  actorCiudadanoId?: number | null;
  observacion: string;
};

/** Datos de estado necesarios para decidir una transicion, sin exponer el modelo. */
export type EstadoActual = {
  emergenciaId: number;
  estadoId: number;
  estadoEsFinal: boolean;
};

export interface IEmergenciaRepository extends IRepository<EmergenciaEntity> {
  contarTodas(): Promise<Result<number>>;
  contarActivas(): Promise<Result<number>>;
  listarConRelaciones(
    query: EmergenciaListadoQuery,
  ): Promise<Result<ListadoEmergencias>>;
  obtenerDetallePorUuid(
    uuid: string,
  ): Promise<Result<EmergenciaConRelaciones | null>>;
  listarPorCiudadano(
    ciudadanoId: number,
  ): Promise<Result<EmergenciaConRelaciones[]>>;
  obtenerDetalleDeCiudadano(
    uuid: string,
    ciudadanoId: number,
  ): Promise<Result<EmergenciaConRelaciones | null>>;
  buscarPorIdempotencia(
    ciudadanoId: number,
    idempotencyKey: string,
  ): Promise<Result<EmergenciaConRelaciones | null>>;
  /**
   * Aplica el cambio y registra el historial en una sola transaccion, tomando
   * lock sobre la fila para que dos operadores no pisen el mismo estado.
   */
  aplicarCambioOperativo(
    uuid: string,
    cambios: CambioOperativo,
    historial: EntradaHistorial | null,
  ): Promise<Result<boolean>>;
  obtenerEstadoActual(uuid: string): Promise<Result<EstadoActual | null>>;
  /**
   * Alta completa en una transaccion: emergencia, respuestas de triage y primera
   * entrada de historial. El codigo publico se asigna con el id ya generado.
   */
  registrarNueva(datos: NuevaEmergencia): Promise<Result<string>>;
  /**
   * Completa, despues de la llamada al 168, una emergencia del propio
   * ciudadano: tipo, afectados, descripcion y respuestas de triage. Rechaza
   * emergencias ajenas o ya finalizadas.
   */
  completarTriage(
    uuid: string,
    ciudadanoId: number,
    datos: ComplementoTriage,
  ): Promise<Result<boolean>>;
}

export type RespuestaTriageNueva = {
  preguntaCodigo: string;
  preguntaTexto: string;
  opcionCodigo: string;
  respuestaTexto: string;
  pesoAplicado: number;
};

export type ComplementoTriage = {
  tipoEmergenciaId: number;
  puntajeTriage: number;
  cantidadAfectados: number;
  descripcion: string | null;
  triage: RespuestaTriageNueva[];
};

export type NuevaEmergencia = {
  uuid: string;
  idempotencyKey: string;
  ciudadanoId: number;
  tipoEmergenciaId: number;
  estadoId: number;
  gravedad: string;
  puntajeTriage: number;
  descripcion?: string | null;
  latitud: number;
  longitud: number;
  precisionMetros?: number | null;
  direccionReferencia?: string | null;
  ubicacionConfirmada: boolean;
  puedeHablar: boolean;
  metadata?: Record<string, unknown> | null;
  triage: RespuestaTriageNueva[];
  observacionHistorial: string;
};
