import { Response } from "express";
import { ErrorCode, Result } from "../types/Result";
import { HttpError } from "./HttpErrors";

/** Unica traduccion de codigo de dominio a estado HTTP. */
const ESTADO_POR_CODIGO: Record<ErrorCode, number> = {
  VALIDACION: 400,
  NO_AUTORIZADO: 401,
  NO_ENCONTRADO: 404,
  CONFLICTO: 409,
  INTERNO: 500,
};

export abstract class BaseHttpController {
  ok<T>(res: Response, dto?: T): Response {
    return res.status(200).json(dto || {});
  }

  created<T>(res: Response, dto?: T): Response {
    return res.status(201).json(dto || {});
  }

  fail(res: Response, error: unknown): Response {
    if (error instanceof HttpError)
      return res.status(error.code).json({ error: error.message });
    if (typeof error === "string") return res.status(400).json({ error });
    return res.status(500).json({ error: String(error || "Error inesperado") });
  }

  /**
   * Responde un Result fallido usando su codigo de dominio. Reemplaza la
   * clasificacion por texto del mensaje, que se rompia al reescribirlo.
   */
  fallo<T>(res: Response, result: Result<T>): Response {
    const codigo = result.errorCode ?? "VALIDACION";
    return res
      .status(ESTADO_POR_CODIGO[codigo])
      .json({ error: result.error || "Error inesperado" });
  }
}
