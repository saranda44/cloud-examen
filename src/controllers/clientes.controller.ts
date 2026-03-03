import { Request, Response } from "express";

export function getClientes(req: Request, res: Response) {
    // Aquí iría la lógica para obtener los clientes de la base de datos
    res.json({ message: "Clientes obtenidos correctamente" });
}

export function getClienteById(req: Request, res: Response) {
    res.json({ message: "Cliente obtenido correctamente" });
}

export function createCliente(req: Request, res: Response) {
    res.json({ message: "Cliente creado correctamente" });
}

export function updateCliente(req: Request, res: Response) {
    res.json({ message: "Cliente actualizado correctamente" });
}

export function deleteCliente(req: Request, res: Response) {
    res.json({ message: "Cliente eliminado correctamente" });
}
