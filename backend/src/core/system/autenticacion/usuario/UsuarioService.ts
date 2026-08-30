import bcrypt from "bcryptjs";
import { BaseService } from "../../../../base/domain/BaseService";
import {
  IUsuarioRepository,
  OperadorDisponible,
} from "./infra/IUsuarioRepository";
import { Result } from "../../../../base/types/Result";
import RolService from "../rol";
import { DeviceInfo, UsuarioEntity, UsuarioProps } from "./UsuarioEntity";

export type CreaUsuarioParams = {
  email: string;
  password: string;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  ci: string;
  direccion: string;
  celular: string;
  genero: "MASCULINO" | "FEMENINO" | "NINGUNO";
  rolId: string;
  avatar?: string;
  isJefe?: boolean;
};

export type EditaUsuarioParams = Partial<CreaUsuarioParams> & {
  id: string;
  estado?: "ACTIVO" | "INACTIVO" | "ELIMINADO";
  devices?: DeviceInfo[];
};

export class UsuarioService extends BaseService<UsuarioEntity, UsuarioProps> {
  private get usuarioRepo(): IUsuarioRepository {
    return this.repo as IUsuarioRepository;
  }

  listarOperadoresActivos(): Promise<Result<OperadorDisponible[]>> {
    return this.usuarioRepo.listarOperadoresActivos();
  }

  operadorDisponible(id: string): Promise<Result<boolean>> {
    return this.usuarioRepo.estaActivo(id);
  }

  async factory(
    props: UsuarioProps,
    id?: string,
  ): Promise<Result<UsuarioEntity>> {
    return UsuarioEntity.create(props, id);
  }

  async creaUsuario(
    params: CreaUsuarioParams,
    id?: string,
  ): Promise<Result<UsuarioEntity>> {
    const rol = await RolService.getById(params.rolId);
    if (rol.isFailure)
      return Result.fail<UsuarioEntity>(rol.error || "Rol no encontrado");

    return this.create(
      {
        username: params.email,
        password: params.password,
        fullname: [params.nombre, params.primerApellido, params.segundoApellido]
          .filter(Boolean)
          .join(" "),
        nombre: params.nombre,
        primerApellido: params.primerApellido,
        segundoApellido: params.segundoApellido,
        ci: params.ci,
        email: params.email,
        direccion: params.direccion,
        celular: params.celular,
        genero: params.genero,
        rolId: params.rolId,
        isJefe: params.isJefe || false,
        estado: "ACTIVO",
        activo: true,
        avatar: params.avatar || "avatar_default.png",
        devices: [],
      },
      id,
    );
  }

  async editaUsuario(
    params: EditaUsuarioParams,
  ): Promise<Result<UsuarioEntity>> {
    const current = await this.getById(params.id);
    if (current.isFailure)
      return Result.fail<UsuarioEntity>(
        current.error || "Usuario no encontrado",
      );

    const user = current.getValue();
    const estado = params.estado || user.props.estado;
    const password =
      params.password && params.password !== "******"
        ? params.password
        : user.props.password;

    return this.update(params.id, {
      username: params.email || user.props.username,
      password,
      fullname: [
        params.nombre || user.props.nombre,
        params.primerApellido || user.props.primerApellido,
        params.segundoApellido || user.props.segundoApellido,
      ]
        .filter(Boolean)
        .join(" "),
      nombre: params.nombre || user.props.nombre,
      primerApellido: params.primerApellido || user.props.primerApellido,
      segundoApellido: params.segundoApellido || user.props.segundoApellido,
      ci: params.ci || user.props.ci,
      email: params.email || user.props.email,
      direccion: params.direccion || user.props.direccion,
      celular: params.celular || user.props.celular,
      genero: params.genero || user.props.genero,
      rolId: params.rolId || user.props.rolId,
      isJefe: params.isJefe ?? user.props.isJefe,
      estado,
      activo: estado === "ACTIVO",
      avatar: params.avatar || user.props.avatar,
      devices: params.devices || user.props.devices,
    });
  }

  async findByEmail(email: string): Promise<Result<UsuarioEntity>> {
    const users = await this.getAll();
    if (users.isFailure)
      return Result.fail<UsuarioEntity>(
        users.error || "Error al buscar usuario",
      );
    const user = users
      .getValue()
      .find(
        (item) => item.props.username === email || item.props.email === email,
      );
    if (!user) return Result.fail<UsuarioEntity>("Usuario no encontrado");
    return Result.ok(user);
  }

  async validateLogin(
    email: string,
    password: string,
  ): Promise<Result<UsuarioEntity>> {
    const user = await this.findByEmail(email);
    if (user.isFailure)
      return Result.fail<UsuarioEntity>(user.error || "Usuario no encontrado");
    if (!user.getValue().props.activo)
      return Result.fail<UsuarioEntity>("Usuario inactivo");
    const valid = await bcrypt.compare(
      password,
      user.getValue().props.password,
    );
    if (!valid) return Result.fail<UsuarioEntity>("Contraseña incorrecta");
    return user;
  }

  async adicionarDispositivoALaLista(
    userId: string,
    deviceInfo: DeviceInfo,
  ): Promise<Result<UsuarioEntity>> {
    const user = await this.getById(userId);
    if (user.isFailure)
      return Result.fail<UsuarioEntity>(user.error || "Usuario no encontrado");
    const current = user.getValue().props.devices || [];
    const devices = current
      .filter((device) => device.token !== deviceInfo.token)
      .concat(deviceInfo);
    return this.update(userId, { devices });
  }
}
