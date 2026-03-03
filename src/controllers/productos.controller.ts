import { Request, Response } from "express";

export function getProductos(req: Request, res: Response) {
    // Aquí iría la lógica para obtener los productos de la base de datos
    res.json({ message: "Productos obtenidos correctamente" });
}

export function getProductoById(req: Request, res: Response) {
    res.json({ message: "Producto obtenido correctamente" });
}

export function createProducto(req: Request, res: Response) {
    res.json({ message: "Producto creado correctamente" });
}

export function updateProducto(req: Request, res: Response) {
    res.json({ message: "Producto actualizado correctamente" });
}

export function deleteProducto(req: Request, res: Response) {
    res.json({ message: "Producto eliminado correctamente" });
}
