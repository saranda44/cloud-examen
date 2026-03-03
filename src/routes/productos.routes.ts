import { Router } from "express";
import {deleteProducto, updateProducto, createProducto, getProductoById, getProductos } from "../controllers/productos.controller";
const router = Router({mergeParams: true}); //heredamos los params de la ruta padre

router.get('/', getProductos);
router.get('/:id', getProductoById);
router.post('/', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);

export default router;