import { Router } from "express";
import { getClientes,getClienteById, createCliente, updateCliente, deleteCliente } from "../controllers/clientes.controller";
import { createClienteValidator, updateClienteValidator, idParamValidator } from "../middlewares/cliente.validate";
import { validateRequest } from "../middlewares/validation";

const router = Router({mergeParams: true}); //heredamos los params de la ruta padre

router.get('/', getClientes);
router.get('/:id', idParamValidator(), validateRequest, getClienteById);
router.post('/', createClienteValidator(), validateRequest, createCliente);
router.put('/:id', idParamValidator(), updateClienteValidator(), validateRequest, updateCliente);
router.delete('/:id', idParamValidator(), validateRequest, deleteCliente);

export default router;