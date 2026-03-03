import { Router } from "express";
//importar funciones de controladores y middlewares necesarios
import { createNota, getNotaByFolio, descargarNota, enviarNota } from "../controllers/notas.controller";
const router = Router({mergeParams: true}); //heredamos los params de la ruta padre

router.post('/', createNota);
router.get('/:folio', getNotaByFolio);
router.get('/:folio/descargar', descargarNota);
router.post('/:folio/enviar', enviarNota);

export default router;