import crypto from "crypto";
import { Result } from "../../../base/types/Result";
import CentroSaludService from "../../../core/emergencias/centro_salud";
import EmergenciaService from "../../../core/emergencias/emergencia";
import { EmergenciaService as EmergenciaServiceClass } from "../../../core/emergencias/emergencia/EmergenciaService";
import EstadoEmergenciaService from "../../../core/emergencias/estado_emergencia";
import EvidenciaEmergenciaService from "../../../core/emergencias/evidencia_emergencia";
import { TipoEvidencia } from "../../../core/emergencias/evidencia_emergencia/infra/IEvidenciaEmergenciaRepository";
import PerfilService from "../../../core/emergencias/perfil";
import { PerfilService as PerfilServiceClass } from "../../../core/emergencias/perfil/PerfilService";
import TipoEmergenciaService from "../../../core/emergencias/tipo_emergencia";

const numeroONulo = (valor: unknown): number | null => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
};

const PREGUNTAS_TRIAGE: Array<[string, string]> = [
  ["breathing", "La persona respira?"],
  ["conscious", "Esta consciente?"],
  ["danger", "Hay riesgo en el lugar?"],
];

const respuestasTriage = (triage: Record<string, string>) =>
  PREGUNTAS_TRIAGE.map(([codigo, texto]) => ({
    preguntaCodigo: codigo,
    preguntaTexto: texto,
    opcionCodigo: triage[codigo] || "NO_SE",
    respuestaTexto: triage[codigo] || "NO_SE",
    pesoAplicado: 0,
  }));

export type NuevaEmergenciaPayload = Record<string, any>;

export class CiudadanoView {
  listarTiposEmergencia() {
    return TipoEmergenciaService.listarActivos();
  }

  buscarCentrosCercanos(query: Record<string, unknown>) {
    return CentroSaludService.buscarCercanos({
      q: query.q ? String(query.q) : undefined,
      latitud: numeroONulo(query.lat),
      longitud: numeroONulo(query.lng),
      limit: Math.min(Math.max(Number(query.limit || 30), 1), 100),
    });
  }

  async obtenerPerfil(ciudadanoId: number) {
    const data = await PerfilService.obtenerPerfilCompleto(ciudadanoId);
    if (data.isFailure) return Result.fail(data.error || "Error al leer perfil");
    const completo = data.getValue();
    if (!completo) return Result.ok(null);
    return Result.ok({
      id: completo.cuenta.uuid,
      email: completo.cuenta.email,
      phone: completo.cuenta.telefono,
      profile: completo.perfil,
      contacts: completo.contactos,
    });
  }

  async actualizarPerfil(
    ciudadanoId: number,
    body: Record<string, any>,
  ): Promise<Result<boolean>> {
    const campos = Object.fromEntries(
      PerfilServiceClass.camposEditables()
        .filter((campo) => Object.prototype.hasOwnProperty.call(body, campo))
        .map((campo) => [campo, body[campo] || null]),
    );

    const cambio: Parameters<typeof PerfilService.guardarPerfilCompleto>[1] = {
      campos,
    };
    if (Object.prototype.hasOwnProperty.call(body, "phone")) {
      cambio.telefono = String(body.phone || "").trim();
    }
    if (body.contact) {
      const nombre = String(body.contact.name || "").trim();
      const telefono = String(body.contact.phone || "").trim();
      if (!nombre || !telefono)
        return Result.fail<boolean>(
          "Nombre y telefono del contacto son requeridos",
        );
      cambio.contacto = {
        nombre,
        telefono,
        parentesco: String(body.contact.relationship || "CONTACTO").trim(),
      };
    }

    return PerfilService.guardarPerfilCompleto(ciudadanoId, cambio);
  }

  /**
   * Alta de emergencia: valida ubicacion y catalogos, calcula el triage en
   * servidor y respeta la idempotencia por ciudadano.
   */
  async registrarEmergencia(
    ciudadanoId: number,
    body: NuevaEmergenciaPayload,
  ): Promise<Result<{ uuid: string; creada: boolean }>> {
    const latitud = numeroONulo(body.latitude);
    const longitud = numeroONulo(body.longitude);
    if (
      latitud === null ||
      longitud === null ||
      latitud < -90 ||
      latitud > 90 ||
      longitud < -180 ||
      longitud > 180
    )
      return Result.fail(
        "Se requiere una ubicacion valida para reportar la emergencia",
      );

    const tipo = await TipoEmergenciaService.buscarPorCodigoActivo(
      String(body.typeCode || "MEDICA").trim(),
    );
    const estado = await EstadoEmergenciaService.buscarPorCodigoActivo(
      "REPORTADA",
    );
    if (
      tipo.isFailure ||
      estado.isFailure ||
      !tipo.getValue() ||
      !estado.getValue()
    )
      return Result.fail("Catalogos de emergencia no configurados");

    const idempotencyKey = String(body.idempotencyKey || crypto.randomUUID());
    const existente = await EmergenciaService.buscarPorIdempotencia(
      ciudadanoId,
      idempotencyKey,
    );
    if (existente.isSuccess && existente.getValue()) {
      const previa = existente.getValue() as { uuid: string };
      return Result.ok({ uuid: previa.uuid, creada: false });
    }

    const triage = (body.triage || {}) as Record<string, string>;
    const gravedad = String(body.severity || "ALTA").toUpperCase();
    const puntaje = EmergenciaServiceClass.calcularPuntajeTriage(
      gravedad,
      triage,
    );

    const registrada = await EmergenciaService.registrarNueva({
      uuid: crypto.randomUUID(),
      idempotencyKey,
      ciudadanoId,
      tipoEmergenciaId: tipo.getValue()!.id,
      estadoId: estado.getValue()!.id,
      gravedad,
      puntajeTriage: puntaje,
      descripcion: String(body.description || "").trim() || null,
      latitud,
      longitud,
      precisionMetros: numeroONulo(body.accuracy),
      direccionReferencia: String(body.address || "").trim() || null,
      ubicacionConfirmada: Boolean(body.locationConfirmed),
      puedeHablar: body.canSpeak !== false,
      metadata: {
        batteryLevel: numeroONulo(body.batteryLevel),
        flow: body.flow || "guided",
      },
      triage: respuestasTriage(triage),
      observacionHistorial: "Emergencia reportada desde la aplicacion movil",
    });
    if (registrada.isFailure)
      return Result.fail(registrada.error || "No se pudo registrar");

    return Result.ok({ uuid: registrada.getValue(), creada: true });
  }

  /**
   * Triage posterior a la llamada al 168: la emergencia ya existe con la
   * ubicacion y aqui se completa lo que el ciudadano pudo contar despues.
   */
  async completarTriage(
    uuid: string,
    ciudadanoId: number,
    body: Record<string, any>,
  ): Promise<Result<boolean>> {
    const tipo = await TipoEmergenciaService.buscarPorCodigoActivo(
      String(body.typeCode || "MEDICA").trim(),
    );
    if (tipo.isFailure || !tipo.getValue())
      return Result.fail("Tipo de emergencia no valido");

    const afectados = Math.trunc(Number(body.affected ?? 1));
    if (!Number.isFinite(afectados) || afectados < 1 || afectados > 999)
      return Result.fail("La cantidad de afectados debe estar entre 1 y 999");

    const triage = (body.triage || {}) as Record<string, string>;
    return EmergenciaService.completarTriage(uuid, ciudadanoId, {
      tipoEmergenciaId: tipo.getValue()!.id,
      puntajeTriage: EmergenciaServiceClass.calcularPuntajeTriage(
        "ALTA",
        triage,
      ),
      cantidadAfectados: afectados,
      descripcion: String(body.description || "").trim().slice(0, 2000) || null,
      triage: respuestasTriage(triage),
    });
  }

  listarEmergencias(ciudadanoId: number) {
    return EmergenciaService.listarPorCiudadano(ciudadanoId);
  }

  obtenerEmergencia(uuid: string, ciudadanoId: number) {
    return EmergenciaService.obtenerDetalleDeCiudadano(uuid, ciudadanoId);
  }

  registrarEvidencia(
    uuid: string,
    ciudadanoId: number,
    body: Record<string, any>,
  ) {
    return EvidenciaEmergenciaService.registrar({
      emergenciaUuid: uuid,
      ciudadanoId,
      tipo: String(body.type || "NOTA").toUpperCase() as TipoEvidencia,
      contenido: String(body.content || "").trim() || null,
      archivoUrl: String(body.fileUrl || "").trim() || null,
      mimeType: body.mimeType ? String(body.mimeType) : null,
      duracionSegundos: numeroONulo(body.durationSeconds),
    });
  }
}

export default new CiudadanoView();
