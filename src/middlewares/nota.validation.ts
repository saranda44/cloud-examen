import { body } from "express-validator";

export function createNotaValidator() {
  return [
    body("folio")
        .trim()
        .notEmpty()
        .withMessage("El folio es obligatorio"),

    body("cliente_id")
        .isInt({ gt: 0 })
        .withMessage("El cliente_id debe ser válido"),

    body("direccion_facturacion_id")
        .isInt({ gt: 0 })
        .withMessage("La dirección de facturación es obligatoria"),

    body("direccion_envio_id")
        .isInt({ gt: 0 })
        .withMessage("La dirección de envío es obligatoria"),

    body("total")
        .optional()
        .isFloat({ gt: 0 })
        .withMessage("El total debe ser mayor a 0"),
  ];
}