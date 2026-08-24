import { Entity } from "../../../base/domain/Entity";
import { Result } from "../../../base/types/Result";

export type CiudadanoProps = {
  uuid: string;
  email: string;
  telefono?: string | null;
  passwordHash: string;
  rol: "CIUDADANO";
  estado: "ACTIVO" | "INACTIVO";
  ultimoAccesoAt?: Date | null;
};

export class CiudadanoEntity extends Entity<CiudadanoProps> {
  private constructor(props: CiudadanoProps, id?: string) {
    super(props, id);
  }

  static create(props: CiudadanoProps, id?: string): Result<CiudadanoEntity> {
    if (!props.uuid?.trim()) return Result.fail("uuid es requerido");
    if (!props.email?.trim()) return Result.fail("email es requerido");
    if (!props.passwordHash?.trim())
      return Result.fail("passwordHash es requerido");

    return Result.ok(
      new CiudadanoEntity(
        { ...props, email: props.email.trim().toLowerCase(), rol: "CIUDADANO" },
        id,
      ),
    );
  }

  estaActivo(): boolean {
    return this.props.estado === "ACTIVO";
  }
}
