import { Op } from "sequelize";
import { Entity } from "./Entity";
import { FindAndCount, IRepository, PaginationQuery } from "./IRepository";
import { Result } from "./Result";

const DEFAULT_LIMIT = 10;

export abstract class BaseSQLRepository<
  T extends Entity<any>,
  TModelData,
> implements IRepository<T> {
  public constructor(protected readonly model: any) {}

  abstract fromSQLModelData(data: TModelData, id: string): Result<T>;
  abstract toSQLModelData(entity: T): TModelData;

  protected searchableFields(): string[] {
    return [];
  }

  async getById(id: string): Promise<Result<T>> {
    const row = await this.model.findByPk(id, { raw: true });
    if (!row) return Result.fail<T>(`No existe registro con id = "${id}"`);
    return this.fromSQLModelData(row, String(row.id));
  }

  async getAll(query?: PaginationQuery): Promise<Result<T[]>> {
    const result = await this.findAndCount(query);
    if (result.isFailure)
      return Result.fail<T[]>(result.error || "Error al listar");
    return Result.ok(result.getValue().rows);
  }

  async findAndCount(
    query: PaginationQuery = {},
  ): Promise<Result<FindAndCount<T>>> {
    const qopts = this.buildQueryOptions(query);
    const result = await this.model.findAndCountAll({ ...qopts, raw: true });
    const mapped = result.rows.map((row: any) =>
      this.fromSQLModelData(row, String(row.id)),
    );
    const invalid = mapped.find((item: Result<T>) => item.isFailure);
    if (invalid)
      return Result.fail<FindAndCount<T>>(invalid.error || "Datos invalidos");
    return Result.ok({
      rows: mapped.map((item: Result<T>) => item.getValue()),
      count: result.count,
    });
  }

  async exists(entity: T): Promise<Result<boolean>> {
    const count = await this.model.count({ where: { id: entity.id } });
    return Result.ok(count > 0);
  }

  async save(entity: T): Promise<Result<T>> {
    const values = this.toSQLModelData(entity);
    const existing = await this.model.findByPk(entity.id);
    if (existing) await existing.update(values);
    else await this.model.create({ id: entity.id, ...values });
    return Result.ok(entity);
  }

  async destroy(id: string): Promise<Result<boolean>> {
    await this.model.destroy({ where: { id } });
    return Result.ok(true);
  }

  protected buildQueryOptions(query: PaginationQuery): Record<string, unknown> {
    const limit = Number(query._limit || DEFAULT_LIMIT);
    const page = Math.max(1, Number(query._page || 1));
    const where: any = {};
    const reserved = new Set(["_limit", "_page", "_sort", "_order", "q"]);

    Object.keys(query).forEach((key) => {
      if (reserved.has(key)) return;
      const value = query[key];
      if (value === undefined || value === null || value === "") return;
      where[key] = value;
    });

    if (query.q && this.searchableFields().length > 0) {
      where[Op.or] = this.searchableFields().map((field) => ({
        [field]: { [Op.like]: `%${query.q}%` },
      }));
    }

    return {
      where,
      limit,
      offset: (page - 1) * limit,
      order: query._sort
        ? [[String(query._sort), String(query._order || "asc").toUpperCase()]]
        : [["id", "DESC"]],
    };
  }
}
