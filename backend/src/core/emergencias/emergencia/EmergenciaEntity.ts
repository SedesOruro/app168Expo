import { Entity } from "../../../base/domain/Entity";
import { Result } from "../../../base/types/Result";

export type EmergenciaProps = {
  uuid: string;
  codigoPublico: string;
  idempotencyKey: string;
  ciudadanoId: number;
  tipoEmergenciaId: number;
  estadoId: number;
  centroSaludSugeridoId?: number | null;
  operadorId?: string | null;
  gravedad?: "ALTA" | "MEDIA" | "BAJA" | string | null;
  puntajeTriage: number;
  descripcion?: string | null;
  cantidadAfectados: number;
  latitud: number;
  longitud: number;
  precisionMetros?: number | null;
  direccionReferencia?: string | null;
  ubicacionConfirmada: boolean;
  puedeHablar: boolean;
  metadata?: Record<string, unknown> | null;
  reportadaAt: Date;
  finalizadaAt?: Date | null;
};

export class EmergenciaEntity extends Entity<EmergenciaProps> {
  private constructor(props: EmergenciaProps, id?: string) {
    super(props, id);
  }

  static create(props: EmergenciaProps, id?: string): Result<EmergenciaEntity> {
    if (!props.uuid?.trim()) return Result.fail("uuid es requerido");
    if (!props.codigoPublico?.trim())
      return Result.fail("codigoPublico es requerido");
    if (!props.idempotencyKey?.trim())
      return Result.fail("idempotencyKey es requerido");
    if (!Number.isInteger(props.ciudadanoId) || props.ciudadanoId <= 0)
      return Result.fail("ciudadanoId es requerido");
    if (!Number.isInteger(props.tipoEmergenciaId) || props.tipoEmergenciaId <= 0)
      return Result.fail("tipoEmergenciaId es requerido");
    if (!Number.isInteger(props.estadoId) || props.estadoId <= 0)
      return Result.fail("estadoId es requerido");
    if (!Number.isFinite(props.latitud) || props.latitud < -90 || props.latitud > 90)
      return Result.fail("latitud invalida");
    if (
      !Number.isFinite(props.longitud) ||
      props.longitud < -180 ||
      props.longitud > 180
    )
      return Result.fail("longitud invalida");
    if (!Number.isInteger(props.cantidadAfectados) || props.cantidadAfectados <= 0)
      return Result.fail("cantidadAfectados debe ser mayor a cero");

    return Result.ok(new EmergenciaEntity(props, id));
  }

  esCritica(): boolean {
    return this.props.puntajeTriage >= 50 || this.props.gravedad === "ALTA";
  }

  estaAsignada(): boolean {
    return Boolean(this.props.operadorId);
  }

  estaFinalizada(): boolean {
    return Boolean(this.props.finalizadaAt);
  }
}
