import { Entity } from "../../../base/domain/Entity";
import { Result } from "../../../base/types/Result";

export type CentroSaludProps = {
  uuid: string;
  codigoRues: string;
  departamento: string;
  redSalud: string;
  municipio: string;
  nombre: string;
  latitud?: number | null;
  longitud?: number | null;
  activo: boolean;
};

export class CentroSaludEntity extends Entity<CentroSaludProps> {
  private constructor(props: CentroSaludProps, id?: string) {
    super(props, id);
  }

  static create(props: CentroSaludProps, id?: string): Result<CentroSaludEntity> {
    const requeridos = [
      ["uuid", props.uuid],
      ["codigoRues", props.codigoRues],
      ["departamento", props.departamento],
      ["redSalud", props.redSalud],
      ["municipio", props.municipio],
      ["nombre", props.nombre],
    ];
    const faltante = requeridos.find(([, value]) => !String(value || "").trim());
    if (faltante) return Result.fail(`${faltante[0]} es requerido`);
    return Result.ok(new CentroSaludEntity(props, id));
  }
}
