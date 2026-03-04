
import { Request, Response } from "express";
import { validationResult, param } from "express-validator";

//validacion del parametro id para obtener, actualizar o eliminar un cliente
export function idParamValidator() {
  return [
    param("id").isInt().withMessage("ID debe ser numérico"),
  ];
}

export function validateRequest(req: Request, res: Response, next: Function) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}