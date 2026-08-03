import { NextFunction, Request, Response } from "express";
import { HttpError } from "../base/HttpErrors";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  if (err instanceof HttpError)
    return res.status(err.code).json({ error: err.message });
  const message = err instanceof Error ? err.message : "Error inesperado";
  return res.status(500).json({ error: message });
};
