import { Result } from "../../../base/types/Result";
import CentroSaludService from "../../../core/emergencias/centro_salud";
import CiudadanoService from "../../../core/emergencias/ciudadano";
import EmergenciaService from "../../../core/emergencias/emergencia";
import EstadoEmergenciaService from "../../../core/emergencias/estado_emergencia";
import UsuarioService from "../../../core/system/autenticacion/usuario";

export type ListQuery = Record<string, unknown>;

export type DashboardResumen = {
  emergencies: number;
  active: number;
  citizens: number;
  centers: number;
};

export type CambioEmergencia = {
  statusCode?: string;
  operatorId?: string | null;
  observation?: string;
  tieneOperador: boolean;
};

const paginacion = (query: ListQuery) => {
  const limit = Math.min(Math.max(Number(query._limit || 10), 1), 100);
  const page = Math.max(Number(query._page || 1), 1);
  return { limit, offset: (page - 1) * limit };
};

const CAMPOS_CENTRO = [
  "codigo_rues",
  "departamento",
  "red_salud",
  "municipio",
  "nombre",
  "subsector",
  "institucion",
  "nivel",
  "tipo",
  "ambito",
  "localidad",
  "direccion",
  "latitud",
  "longitud",
  "activo",
];

export class OperacionesView {
  async obtenerDashboard(): Promise<Result<DashboardResumen>> {
    const [emergencies, active, citizens, centers] = await Promise.all([
      EmergenciaService.contarTodas(),
      EmergenciaService.contarActivas(),
      CiudadanoService.contarActivos(),
      CentroSaludService.contarActivos(),
    ]);
    const fallo = [emergencies, active, citizens, centers].find(
      (item) => item.isFailure,
    );
    if (fallo)
      return Result.fail<DashboardResumen>(
        fallo.error || "No se pudo calcular el resumen",
      );

    return Result.ok({
      emergencies: emergencies.getValue(),
      active: active.getValue(),
      citizens: citizens.getValue(),
      centers: centers.getValue(),
    });
  }

  async listarEmergencias(query: ListQuery) {
    const { limit, offset } = paginacion(query);
    return EmergenciaService.listarConRelaciones({
      limit,
      offset,
      q: query.q ? String(query.q) : undefined,
      estadoId: query.estado ? Number(query.estado) : undefined,
    });
  }

  obtenerEmergencia(uuid: string) {
    return EmergenciaService.obtenerDetallePorUuid(uuid);
  }

  /**
   * Valida catalogos y operador antes de delegar la transicion al servicio,
   * que es quien conoce la regla de no reabrir una emergencia finalizada.
   */
  async actualizarEmergencia(
    uuid: string,
    cambio: CambioEmergencia,
    actorAdminId?: string | null,
  ): Promise<Result<boolean>> {
    const estadoActual = await EmergenciaService.obtenerEstadoActual(uuid);
    if (estadoActual.isFailure)
      return Result.fail<boolean>(estadoActual.error || "Error al leer estado");
    const actual = estadoActual.getValue();
    if (!actual) return Result.noEncontrado<boolean>("Emergencia no encontrada");

    let nuevoEstado: { id: number; esFinal: boolean } | null = null;
    if (cambio.statusCode) {
      const encontrado = await EstadoEmergenciaService.buscarPorCodigoActivo(
        String(cambio.statusCode),
      );
      if (encontrado.isFailure || !encontrado.getValue())
        return Result.fail<boolean>("Estado no valido");
      const estado = encontrado.getValue()!;
      nuevoEstado = { id: estado.id, esFinal: estado.esFinal };
    }

    let operadorId: string | null | undefined;
    if (cambio.tieneOperador) {
      operadorId = cambio.operatorId ? String(cambio.operatorId) : null;
      if (operadorId) {
        const disponible = await UsuarioService.operadorDisponible(operadorId);
        if (disponible.isFailure || !disponible.getValue())
          return Result.fail<boolean>("Operador no disponible");
      }
    }

    return EmergenciaService.cambiarEstadoOperativo(
      uuid,
      actual,
      nuevoEstado,
      operadorId,
      String(cambio.observation || "Actualizacion desde administracion"),
      actorAdminId,
    );
  }

  listarEstados() {
    return EstadoEmergenciaService.listarActivos();
  }

  listarOperadores() {
    return UsuarioService.listarOperadoresActivos();
  }

  async listarCiudadanos(query: ListQuery) {
    const { limit, offset } = paginacion(query);
    return CiudadanoService.listarConPerfil({
      limit,
      offset,
      q: query.q ? String(query.q) : undefined,
    });
  }

  async cambiarEstadoCiudadano(uuid: string, activo: boolean) {
    return CiudadanoService.cambiarEstadoPorUuid(uuid, activo);
  }

  async listarCentrosSalud(query: ListQuery) {
    const { limit, offset } = paginacion(query);
    return CentroSaludService.listarPaginado({
      limit,
      offset,
      q: query.q ? String(query.q) : undefined,
      sort: query._sort ? String(query._sort) : undefined,
      order:
        String(query._order || "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC",
    });
  }

  async crearCentroSalud(datos: Record<string, unknown>) {
    const requeridos = [
      datos.codigo_rues,
      datos.nombre,
      datos.departamento,
      datos.red_salud,
      datos.municipio,
    ];
    if (requeridos.some((valor) => !String(valor || "").trim()))
      return Result.fail("Complete los campos obligatorios");

    return CentroSaludService.crear({
      ...datos,
      uuid: crypto.randomUUID(),
      fuente_archivo: "ADMIN_168",
      gestion_fuente: new Date().getFullYear(),
      activo: datos.activo !== false,
    });
  }

  async actualizarCentroSalud(uuid: string, datos: Record<string, unknown>) {
    const cambios = Object.fromEntries(
      CAMPOS_CENTRO.filter((campo) =>
        Object.prototype.hasOwnProperty.call(datos, campo),
      ).map((campo) => [campo, datos[campo]]),
    );
    return CentroSaludService.actualizarPorUuid(uuid, cambios);
  }

  desactivarCentroSalud(uuid: string) {
    return CentroSaludService.desactivarPorUuid(uuid);
  }
}

export default new OperacionesView();
