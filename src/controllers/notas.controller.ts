import { Request, Response } from "express";

export function getNotaByFolio(req: Request, res: Response) {
    res.json({ message: "Nota obtenida correctamente" });
}

export function createNota(req: Request, res: Response) {
    res.json({ message: "Nota creada correctamente" });
}

export function descargarNota(req: Request, res: Response) {
    res.json({ message: "Nota descargada correctamente" });
}

export function enviarNota(req: Request, res: Response) {
    res.json({ message: "Nota enviada correctamente" });
}
