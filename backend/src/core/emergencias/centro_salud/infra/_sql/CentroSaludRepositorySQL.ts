import { Op } from "sequelize";
import { BaseSQLRepository } from "../../../../../base/infra/_sql/BaseSQLRepository";
import { Result } from "../../../../../base/types/Result";
import { CentroSaludEntity } from "../../CentroSaludEntity";
import {
  CentroCercanoQuery,
  CentroSaludFila,
  CentroSaludListadoQuery,
  ICentroSaludRepository,
  ListadoCentros,
} from "../ICentroSaludRepository";
import { CentroSaludSQLModelData } from "./CentroSaludSQLModel";

export class CentroSaludRepositorySQL
  extends BaseSQLRepository<CentroSaludEntity, CentroSaludSQLModelData>
  implements ICentroSaludRepository
{
  protected searchableFields(): string[] {
    return ["codigo_rues", "nombre", "municipio"];
  }

  fromSQLModelData(
    data: CentroSaludSQLModelData,
    id: string,
  ): Result<CentroSaludEntity> {
    return CentroSaludEntity.create(
      {
        uuid: data.uuid,
        codigoRues: data.codigo_rues,
        departamento: data.departamento,
        redSalud: data.red_salud,
        municipio: data.municipio,
        nombre: data.nombre,
        latitud: data.latitud === null ? null : Number(data.latitud),
        longitud: data.longitud === null ? null : Number(data.longitud),
        activo: data.activo,
      },
      id,
    );
  }

  toSQLModelData(entity: CentroSaludEntity): CentroSaludSQLModelData {
    return {
      id: Number(entity.id),
      uuid: entity.props.uuid,
      codigo_rues: entity.props.codigoRues,
      departamento: entity.props.departamento,
      red_salud: entity.props.redSalud,
      municipio: entity.props.municipio,
      nombre: entity.props.nombre,
      latitud: entity.props.latitud,
      longitud: entity.props.longitud,
      activo: entity.props.activo,
    };
  }

  // ---- consultas del agregado -------------------------------------------

  async contarActivos(): Promise<Result<number>> {
    return Result.ok(await this.model.count({ where: { activo: true } }));
  }

  async listarPaginado(
    query: CentroSaludListadoQuery,
  ): Promise<Result<ListadoCentros>> {
    const permitidos = new Set([
      "nombre",
      "codigo_rues",
      "municipio",
      "localidad",
      "created_at",
    ]);
    const sort = permitidos.has(String(query.sort)) ? String(query.sort) : "nombre";
    const order = query.order === "DESC" ? "DESC" : "ASC";

    const where: Record<string | symbol, unknown> = {};
    const search = String(query.q || "").trim();
    if (search) {
      where[Op.or] = ["nombre", "codigo_rues", "municipio", "localidad"].map(
        (field) => ({ [field]: { [Op.like]: `%${search}%` } }),
      );
    }
    const result = await this.model.findAndCountAll({
      where,
      order: [[sort, order]],
      limit: query.limit,
      offset: query.offset,
    });
    return Result.ok({ rows: result.rows, count: result.count });
  }

  /**
   * Centros del departamento de Oruro ordenados por distancia Haversine al
   * punto indicado. Los que no tienen coordenadas quedan al final.
   */
  async buscarCercanos(
    query: CentroCercanoQuery,
  ): Promise<Result<CentroSaludFila[]>> {
    const oruroKmCero = { latitude: -17.9695681, longitude: -67.1147287 };
    const latitud = query.latitud ?? oruroKmCero.latitude;
    const longitud = query.longitud ?? oruroKmCero.longitude;

    const where: Record<string | symbol, unknown> = {
      activo: true,
      departamento: "Oruro",
    };
    const search = String(query.q || "").trim();
    if (search) {
      where[Op.or] = ["nombre", "municipio", "localidad", "codigo_rues"].map(
        (field) => ({ [field]: { [Op.like]: `%${search}%` } }),
      );
    }

    const filas = await this.model.findAll({ where });
    const resultado = filas
      .map((fila: any) => {
        const item = fila.toJSON();
        const lat = numeroONulo(item.latitud);
        const lng = numeroONulo(item.longitud);
        return {
          ...item,
          distanceKm:
            lat !== null && lng !== null
              ? distanciaKm(latitud, longitud, lat, lng)
              : null,
        };
      })
      .sort((a: any, b: any) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      })
      .slice(0, query.limit);
    return Result.ok(resultado);
  }

  async crear(datos: Record<string, unknown>): Promise<Result<CentroSaludFila>> {
    return Result.ok(await this.model.create(datos));
  }

  async actualizarPorUuid(
    uuid: string,
    cambios: Record<string, unknown>,
  ): Promise<Result<CentroSaludFila | null>> {
    const fila = await this.model.findOne({ where: { uuid } });
    if (!fila) return Result.ok(null);
    await fila.update(cambios);
    return Result.ok(fila);
  }

  async desactivarPorUuid(uuid: string): Promise<Result<boolean>> {
    const fila = await this.model.findOne({ where: { uuid } });
    if (!fila) return Result.noEncontrado<boolean>("Centro de salud no encontrado");
    await fila.update({ activo: false });
    return Result.ok(true);
  }
}

const numeroONulo = (valor: unknown): number | null => {
  if (valor === null || valor === undefined || valor === "") return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
};

const distanciaKm = (
  desdeLat: number,
  desdeLng: number,
  hastaLat: number,
  hastaLng: number,
): number => {
  const radianes = (grados: number) => (grados * Math.PI) / 180;
  const deltaLat = radianes(hastaLat - desdeLat);
  const deltaLng = radianes(hastaLng - desdeLng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radianes(desdeLat)) *
      Math.cos(radianes(hastaLat)) *
      Math.sin(deltaLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
