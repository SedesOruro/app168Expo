import { randomUUID } from "node:crypto";

export abstract class Entity<TProps> {
  protected readonly _id: string;
  public readonly props: TProps;

  protected constructor(props: TProps, id?: string) {
    this._id = id || randomUUID();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  equals(entity?: Entity<TProps>): boolean {
    return !!entity && this._id === entity._id;
  }
}


