import { body } from "express-validator";

export function createDetalleNotaValidator() {
  return [
    body("detalles.*.producto_id")
      .isInt({ min: 1 })
      .withMessage("producto_id debe ser válido"),

    body("detalles.*.cantidad")
      .isFloat({ min: 0.01 })
      .withMessage("La cantidad debe ser mayor a 0"),

    body("detalles.*.precio_unitario")
      .isFloat({ min: 0 })
      .withMessage("El precio unitario debe ser mayor o igual a 0"),
  ];
}