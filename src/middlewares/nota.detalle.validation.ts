import { body } from "express-validator";

export function createNotaDetalleValidator() {
  return [
    body("nota_id")
        .isInt({ gt: 0 })
        .withMessage("La nota_id debe ser válida"),

    body("producto_id")
        .isInt({ gt: 0 })
        .withMessage("El producto_id debe ser válido"),

    body("cantidad")
        .isFloat({ gt: 0 })
        .withMessage("La cantidad debe ser mayor a 0"),

    body("precio_unitario")
        .isFloat({ gt: 0 })
        .withMessage("El precio unitario debe ser mayor a 0"),

    body("importe")
        .optional()
        .isFloat({ gt: 0 })
        .withMessage("El importe debe ser mayor a 0"),
  ];
}