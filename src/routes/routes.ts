import { Router, json } from "express";
import clientesRoutes from "./clientes.routes";
const router = Router();

// Middleware para parsear JSON
router.use(json());
router.use('/clientes', clientesRoutes);



export default router;