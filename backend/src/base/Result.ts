export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly error?: string;
  private readonly value?: T;

  private constructor(isSuccess: boolean, error?: string, value?: T) {
    if (isSuccess && error)
      throw new Error("A result cannot be successful and contain an error");
    if (!isSuccess && !error)
      throw new Error("A failing result needs an error message");
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this.value = value;
  }

  getValue(): T {
    if (!this.isSuccess || this.value === undefined) {
      throw new Error("Value not set. Use error instead.");
    }
    return this.value;
  }

  static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }
}
