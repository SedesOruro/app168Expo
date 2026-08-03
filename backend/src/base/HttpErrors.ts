export class HttpError extends Error {
  constructor(
    public readonly code: number,
    message: string,
  ) {
    super(message);
  }
}

export class BadRequest extends HttpError {
  constructor(message = "Datos invalidos") {
    super(400, message);
  }
}

export class Unauthorized extends HttpError {
  constructor(message = "Debe autenticarse para acceder al recurso") {
    super(401, message);
  }
}

export class Forbidden extends HttpError {
  constructor(message = "Permisos insuficientes") {
    super(403, message);
  }
}

export class NotFound extends HttpError {
  constructor(message = "Recurso no encontrado") {
    super(404, message);
  }
}
