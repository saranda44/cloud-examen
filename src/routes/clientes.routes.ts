import { Router } from "express";
//importar funciones de controladores y middlewares necesarios
import { getClientes,getClienteById, createCliente, updateCliente, deleteCliente } from "../controllers/clientes.controller";
const router = Router({mergeParams: true}); //heredamos los params de la ruta padre

router.get('/', getClientes);
router.get('/:id', getClienteById);
router.post('/', createCliente);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);

export default router;