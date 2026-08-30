import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Result } from "../../../base/types/Result";
import CiudadanoService from "../../../core/emergencias/ciudadano";
import { SesionInicial } from "../../../core/emergencias/ciudadano/infra/ICiudadanoRepository";
import SesionRefreshService from "../../../core/emergencias/sesion_refresh";
import { env } from "../../../config/env";
import { signToken } from "../../../utils/jwt";

export type DatosRegistroEntrada = {
  names?: string;
  surnames?: string;
  document?: string;
  complement?: string;
  birthDate?: string;
  phone?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  email?: string;
  password?: string;
  acceptedTerms?: boolean;
};

export type ContextoPeticion = {
  dispositivo: string | null;
  ipOrigen: string | null;
};

export type SesionEmitida = {
  user: { id: string; name: string; email: string };
  accessToken: string;
  refreshToken: string;
};

const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

/** Material de sesion: tokens en memoria, nada persistido todavia. */
const prepararSesion = (contexto: ContextoPeticion) => {
  const refreshToken = crypto.randomBytes(48).toString("base64url");
  const expiraAt = new Date();
  expiraAt.setUTCDate(expiraAt.getUTCDate() + env.jwt.refreshDays);
  const datos: SesionInicial = {
    jti: crypto.randomUUID(),
    tokenHash: hashToken(refreshToken),
    dispositivo: contexto.dispositivo,
    ipOrigen: contexto.ipOrigen,
    expiraAt,
  };
  return { refreshToken, datos };
};

const accessTokenDe = (uuid: string, email: string): string =>
  signToken({ uid: uuid, email, rol: "ciudadano", kind: "ciudadano" });

export class AutenticacionCiudadanoView {
  async registrar(
    entrada: DatosRegistroEntrada,
    contexto: ContextoPeticion,
  ): Promise<Result<SesionEmitida>> {
    const requeridos = [
      entrada.names,
      entrada.surnames,
      entrada.document,
      entrada.birthDate,
      entrada.phone,
      entrada.address,
      entrada.contactName,
      entrada.contactPhone,
      entrada.email,
      entrada.password,
    ];
    if (requeridos.some((valor) => !String(valor || "").trim()))
      return Result.fail("Complete todos los campos obligatorios");
    if (!entrada.acceptedTerms)
      return Result.fail("Debe aceptar los terminos y condiciones");
    if (String(entrada.password).length < 8)
      return Result.fail("La contrasena debe tener al menos 8 caracteres");

    const email = String(entrada.email).trim().toLowerCase();
    const telefono = String(entrada.phone).trim();
    const cedula = String(entrada.document).trim();
    const complemento = String(entrada.complement || "").trim() || null;

    const duplicado = await CiudadanoService.existeCorreoOTelefono(
      email,
      telefono,
    );
    if (duplicado.isSuccess && duplicado.getValue())
      return Result.conflicto("El correo o telefono ya esta registrado");

    const documento = await CiudadanoService.existeDocumento(
      cedula,
      complemento,
    );
    if (documento.isSuccess && documento.getValue())
      return Result.conflicto("La cedula de identidad ya esta registrada");

    const { refreshToken, datos } = prepararSesion(contexto);
    const cuenta = await CiudadanoService.registrarCuenta(
      {
        email,
        telefono,
        passwordHash: await bcrypt.hash(String(entrada.password), 10),
        nombres: String(entrada.names).trim(),
        apellidos: String(entrada.surnames).trim(),
        cedulaIdentidad: cedula,
        complementoCi: complemento,
        fechaNacimiento: String(entrada.birthDate),
        direccion: String(entrada.address).trim(),
        contactoNombre: String(entrada.contactName).trim(),
        contactoTelefono: String(entrada.contactPhone).trim(),
        terminosVersion: "1.0",
      },
      datos,
    );
    if (cuenta.isFailure)
      return Result.fail(cuenta.error || "No se pudo registrar la cuenta");

    const nueva = cuenta.getValue();
    return Result.ok({
      user: {
        id: nueva.uuid,
        name: nueva.nombreCompleto,
        email: nueva.email,
      },
      accessToken: accessTokenDe(nueva.uuid, nueva.email),
      refreshToken,
    });
  }

  async iniciarSesion(
    email: string,
    password: string,
    contexto: ContextoPeticion,
  ): Promise<Result<SesionEmitida>> {
    const correo = String(email || "").trim().toLowerCase();
    if (!correo || !password)
      return Result.fail("Correo y contrasena son requeridos");

    const credencial = await CiudadanoService.buscarCredencialPorCorreo(correo);
    if (credencial.isFailure)
      return Result.fail(credencial.error || "Error al validar credenciales");
    const cuenta = credencial.getValue();
    const valido = cuenta
      ? await bcrypt.compare(String(password), cuenta.passwordHash)
      : false;
    if (!cuenta || !valido || cuenta.estado !== "ACTIVO")
      return Result.noAutorizado("Credenciales incorrectas");

    await CiudadanoService.actualizarUltimoAcceso(cuenta.id);

    const { refreshToken, datos } = prepararSesion(contexto);
    const guardada = await SesionRefreshService.crear({
      ciudadanoId: cuenta.id,
      ...datos,
    });
    if (guardada.isFailure)
      return Result.fail(guardada.error || "No se pudo crear la sesion");

    const resumen = await CiudadanoService.obtenerResumen(cuenta.id);
    const nombre =
      resumen.isSuccess && resumen.getValue()
        ? resumen.getValue()!.nombreCompleto
        : cuenta.email;

    return Result.ok({
      user: { id: cuenta.uuid, name: nombre, email: cuenta.email },
      accessToken: accessTokenDe(cuenta.uuid, cuenta.email),
      refreshToken,
    });
  }

  async refrescar(
    refreshTokenActual: string,
    contexto: ContextoPeticion,
  ): Promise<Result<SesionEmitida | null>> {
    if (!refreshTokenActual)
      return Result.fail("refreshToken es requerido");

    const { refreshToken, datos } = prepararSesion(contexto);
    const rotada = await SesionRefreshService.rotar(
      hashToken(refreshTokenActual),
      datos,
    );
    if (rotada.isFailure)
      return Result.fail(rotada.error || "No se pudo rotar la sesion");
    const cuenta = rotada.getValue();
    if (!cuenta) return Result.ok(null);

    const resumen = await CiudadanoService.obtenerResumen(cuenta.id);
    const nombre =
      resumen.isSuccess && resumen.getValue()
        ? resumen.getValue()!.nombreCompleto
        : cuenta.email;

    return Result.ok({
      user: { id: cuenta.uuid, name: nombre, email: cuenta.email },
      accessToken: accessTokenDe(cuenta.uuid, cuenta.email),
      refreshToken,
    });
  }

  async cerrarSesion(refreshToken: string): Promise<Result<boolean>> {
    if (!refreshToken) return Result.ok(true);
    return SesionRefreshService.revocarPorHash(hashToken(refreshToken));
  }

  async obtenerCuenta(ciudadanoId: number) {
    const resumen = await CiudadanoService.obtenerResumen(ciudadanoId);
    if (resumen.isFailure)
      return Result.fail(resumen.error || "Error al leer la cuenta");
    const cuenta = resumen.getValue();
    if (!cuenta) return Result.ok(null);
    return Result.ok({
      id: cuenta.uuid,
      name: cuenta.nombreCompleto,
      email: cuenta.email,
    });
  }
}

export default new AutenticacionCiudadanoView();
