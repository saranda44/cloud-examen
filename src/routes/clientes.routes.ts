import { Router } from "express";
//importar funciones de controladores y middlewares necesarios

const router = Router({mergeParams: true}); //heredamos los params de la ruta padre

router.get('/clientes', (req, res) => {
    //aqui llamamos a la función del controlador para obtener los clientes
    console.log("Obteniendo clientes...");  
    // Aquí iría la lógica para obtener los clientes de la base de datos
    res.json({ message: "Clientes obtenidos correctamente" });
});

export default router;