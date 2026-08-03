import { Entity } from "./Entity";
import { IRepository, PaginationQuery, FindAndCount } from "./IRepository";
import { Result } from "./Result";

export abstract class BaseService<T extends Entity<any>, TProps> {
  public constructor(protected readonly repo: IRepository<T>) {}

  abstract factory(props: TProps, id?: string): Promise<Result<T>>;

  async create(props: TProps, id?: string): Promise<Result<T>> {
    const entity = await this.factory(props, id);
    if (entity.isFailure)
      return Result.fail<T>(entity.error || "Entidad invalida");
    return this.repo.save(entity.getValue());
  }

  async update(id: string, props: Partial<TProps>): Promise<Result<T>> {
    const current = await this.repo.getById(id);
    if (current.isFailure)
      return Result.fail<T>(current.error || "Entidad no encontrada");
    const entity = await this.factory(
      { ...current.getValue().props, ...props } as TProps,
      id,
    );
    if (entity.isFailure)
      return Result.fail<T>(entity.error || "Entidad invalida");
    return this.repo.save(entity.getValue());
  }

  getById(id: string): Promise<Result<T>> {
    return this.repo.getById(id);
  }

  getAll(query?: PaginationQuery): Promise<Result<T[]>> {
    return this.repo.getAll(query);
  }

  findAndCount(query?: PaginationQuery): Promise<Result<FindAndCount<T>>> {
    return this.repo.findAndCount(query);
  }

  delete(id: string): Promise<Result<boolean>> {
    return this.repo.destroy(id);
  }
}
