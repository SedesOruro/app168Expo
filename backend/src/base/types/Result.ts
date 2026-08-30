/**
 * Clasificacion del fallo, independiente del transporte. La capa HTTP la
 * traduce a un codigo de estado; el dominio nunca conoce numeros HTTP.
 */
export type ErrorCode =
  | "VALIDACION"
  | "CONFLICTO"
  | "NO_ENCONTRADO"
  | "NO_AUTORIZADO"
  | "INTERNO";

export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly error?: string;
  public readonly errorCode?: ErrorCode;
  private readonly value?: T;

  private constructor(
    isSuccess: boolean,
    error?: string,
    value?: T,
    errorCode?: ErrorCode,
  ) {
    if (isSuccess && error)
      throw new Error("A result cannot be successful and contain an error");
    if (!isSuccess && !error)
      throw new Error("A failing result needs an error message");
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this.errorCode = errorCode;
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

  /** Fallo generico. Sin codigo explicito se trata como error de validacion. */
  static fail<U>(error: string, errorCode: ErrorCode = "VALIDACION"): Result<U> {
    return new Result<U>(false, error, undefined, errorCode);
  }

  /** El recurso solicitado no existe. */
  static noEncontrado<U>(error: string): Result<U> {
    return Result.fail<U>(error, "NO_ENCONTRADO");
  }

  /** Choca con un registro existente: correo, telefono o documento repetido. */
  static conflicto<U>(error: string): Result<U> {
    return Result.fail<U>(error, "CONFLICTO");
  }

  /** Credenciales invalidas o sesion no vigente. */
  static noAutorizado<U>(error: string): Result<U> {
    return Result.fail<U>(error, "NO_AUTORIZADO");
  }
}
