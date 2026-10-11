import { BaseService } from "../../../base/domain/BaseService";
import { Result } from "../../../base/types/Result";
import { CiudadanoEntity, CiudadanoProps } from "./CiudadanoEntity";
import {
  CiudadanoListadoQuery,
  CredencialCiudadano,
  CuentaResumen,
  DatosRegistro,
  ICiudadanoRepository,
  ListadoCiudadanos,
  SesionInicial,
} from "./infra/ICiudadanoRepository";

export class CiudadanoService extends BaseService<
  CiudadanoEntity,
  CiudadanoProps
> {
  public constructor(protected readonly repo: ICiudadanoRepository) {
    super(repo);
  }

  factory(
    props: CiudadanoProps,
    id?: string,
  ): Promise<Result<CiudadanoEntity>> {
    return Promise.resolve(CiudadanoEntity.create(props, id));
  }

  async buscarPorCorreo(email: string): Promise<Result<CiudadanoEntity>> {
    const ciudadanos = await this.getAll({ email: email.trim().toLowerCase() });
    if (ciudadanos.isFailure) return Result.fail(ciudadanos.error || "Error al buscar ciudadano");
    const ciudadano = ciudadanos.getValue()[0];
    return ciudadano
      ? Result.ok(ciudadano)
      : Result.fail("Ciudadano no encontrado");
  }

  contarActivos(): Promise<Result<number>> {
    return this.repo.contarActivos();
  }

  listarConPerfil(
    query: CiudadanoListadoQuery,
  ): Promise<Result<ListadoCiudadanos>> {
    return this.repo.listarConPerfil(query);
  }

  cambiarEstadoPorUuid(
    uuid: string,
    activo: boolean,
  ): Promise<Result<boolean>> {
    return this.repo.cambiarEstadoPorUuid(uuid, activo ? "ACTIVO" : "INACTIVO");
  }

  buscarCedulaPorUuid(uuid: string): Promise<Result<string | null>> {
    return this.repo.buscarCedulaPorUuid(uuid);
  }

  actualizarPasswordPorUuid(
    uuid: string,
    passwordHash: string,
  ): Promise<Result<boolean>> {
    return this.repo.actualizarPasswordPorUuid(uuid, passwordHash);
  }

  buscarCredencialPorCorreo(
    email: string,
  ): Promise<Result<CredencialCiudadano | null>> {
    return this.repo.buscarCredencialPorCorreo(email);
  }

  existeCorreoOTelefono(
    email: string,
    telefono: string,
  ): Promise<Result<boolean>> {
    return this.repo.existeCorreoOTelefono(email, telefono);
  }

  existeDocumento(
    cedula: string,
    complemento: string | null,
  ): Promise<Result<boolean>> {
    return this.repo.existeDocumento(cedula, complemento);
  }

  registrarCuenta(
    datos: DatosRegistro,
    sesion: SesionInicial,
  ): Promise<Result<CuentaResumen>> {
    return this.repo.registrarCuenta(datos, sesion);
  }

  actualizarUltimoAcceso(id: number): Promise<Result<boolean>> {
    return this.repo.actualizarUltimoAcceso(id);
  }

  obtenerResumen(id: number): Promise<Result<CuentaResumen | null>> {
    return this.repo.obtenerResumen(id);
  }

  buscarActivoPorUuid(
    uuid: string,
  ): Promise<Result<{ id: number; uuid: string } | null>> {
    return this.repo.buscarActivoPorUuid(uuid);
  }
}
