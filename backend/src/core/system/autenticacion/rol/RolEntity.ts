import { Entity } from "../../../../base/domain/Entity";
import { Result } from "../../../../base/types/Result";

export type Permiso = {
  read?: boolean;
  create?: boolean;
  edit?: boolean;
  remove?: boolean;
  send?: boolean;
  download?: boolean;
  approve?: boolean;
  lock?: boolean;
};

export type Modulo = {
  id?: string;
  name?: string;
  path?: string;
  title?: string;
  icon?: string;
  color?: string;
};

export type RolProps = {
  nombre: string;
  tipo: string;
  permisos: string;
  modulos: Modulo[];
};

export class RolEntity extends Entity<RolProps> {
  private constructor(props: RolProps, id?: string) {
    super(props, id);
  }

  static create(props: RolProps, id?: string): Result<RolEntity> {
    if (!props.nombre?.trim())
      return Result.fail<RolEntity>("nombre es requerido");
    const tipo =
      props.tipo?.trim() ||
      props.nombre
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s/g, "");
    return Result.ok(
      new RolEntity({ ...props, nombre: props.nombre.trim(), tipo }, id),
    );
  }

  getPermisos(): Permiso {
    try {
      return JSON.parse(this.props.permisos || "{}") as Permiso;
    } catch {
      return {};
    }
  }
}
