import { Router } from "express";
import { createNota, getNotaById, descargarNota, enviarNota } from "../controllers/notas.controller";
import { createNotaValidator } from "../middlewares/nota.validation";
import { createDetalleNotaValidator } from "../middlewares/nota.detalle.validation";
import { idParamValidator, validateRequest } from "../middlewares/validation";
const router = Router({ mergeParams: true });

router.get('/:rfc/:folio/descargar', descargarNota);
router.post('/:rfc/:folio/enviar', enviarNota);
router.get('/:id', idParamValidator(), validateRequest, getNotaById);
router.post('/', createNotaValidator(), createDetalleNotaValidator(), validateRequest, createNota);

export default router;