import { Response } from "express";
import { HttpError } from "./HttpErrors";

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
}
