import { Result } from "./Result";

export interface PaginationQuery {
  _limit?: string | number;
  _page?: string | number;
  _sort?: string;
  _order?: "asc" | "desc" | "ASC" | "DESC";
  q?: string;
  [key: string]: unknown;
}

export interface FindAndCount<T> {
  rows: T[];
  count: number;
}

export interface IRepository<T> {
  getById(id: string): Promise<Result<T>>;
  getAll(query?: PaginationQuery): Promise<Result<T[]>>;
  findAndCount(query?: PaginationQuery): Promise<Result<FindAndCount<T>>>;
  exists(entity: T): Promise<Result<boolean>>;
  save(entity: T): Promise<Result<T>>;
  destroy(id: string): Promise<Result<boolean>>;
}
