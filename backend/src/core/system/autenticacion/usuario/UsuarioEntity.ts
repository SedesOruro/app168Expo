import { Entity } from "../../../../base/domain/Entity";
import { Result } from "../../../../base/types/Result";

export type DeviceInfo = {
  token: string;
  browser?: string;
  version?: string;
  os?: string;
  platform?: string;
  source?: string;
};

export type UsuarioProps = {
  username: string;
  password: string;
  fullname: string;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  ci: string;
  email: string;
  direccion: string;
  celular: string;
  genero: "MASCULINO" | "FEMENINO" | "NINGUNO";
  activo: boolean;
  estado: "ACTIVO" | "INACTIVO" | "ELIMINADO";
  avatar?: string;
  rolId: string;
  devices?: DeviceInfo[];
};

const construirNombre = (...parts: Array<string | undefined>): string =>
  parts.filter(Boolean).join(" ").trim();

export class UsuarioEntity extends Entity<UsuarioProps> {
  private constructor(props: UsuarioProps, id?: string) {
    super(props, id);
  }

  static create(props: UsuarioProps, id?: string): Result<UsuarioEntity> {
    if (!props.email?.trim())
      return Result.fail<UsuarioEntity>("email es requerido");
    if (!props.rolId?.trim())
      return Result.fail<UsuarioEntity>("rolId es requerido");
    return Result.ok(
      new UsuarioEntity(
        { ...props, username: props.username || props.email },
        id,
      ),
    );
  }

  getNombreCompleto(): string {
    return construirNombre(
      this.props.nombre,
      this.props.primerApellido,
      this.props.segundoApellido,
    );
  }

  getNombreCompletoCI(): string {
    return `${this.getNombreCompleto()} - ${this.props.ci}`.trim();
  }
}
