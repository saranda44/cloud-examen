import { Router } from "express";
import { getDomicilios,getDomicilioById, getDomiciliosByCliente, updateDomicilio, createDomicilio, deleteDomicilio } from "../controllers/domicilio.controller";
const router = Router({mergeParams: true}); //heredamos los params de la ruta padre

router.get('/', getDomicilios);
router.get('/:id', getDomicilioById);
router.get('/clientes/:clienteID', getDomiciliosByCliente);
router.post('/', createDomicilio);
router.put('/:id', updateDomicilio);
router.delete('/:id', deleteDomicilio);

export default router;