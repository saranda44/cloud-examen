import { Request, Response } from "express";
import { NotaService } from "../services/notas.service";

export async function getNotaById(req: Request, res: Response) {
    try {
        const nota = await NotaService.findById(Number(req.params.id));
        res.json(nota);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la nota" });
    }
}

export async function createNota(req: Request, res: Response) {
    try {
        const nota = await NotaService.createNota(req.body, req.body.detalles);
        res.status(201).json(nota);
    } catch (error) {
        res.status(500).json({ message: "Error al crear la nota" });
    }
}

export async function descargarNota(req: Request, res: Response) {
    try {
        const nota = await NotaService.findById(Number(req.params.id));
        res.json(nota);
    } catch (error) {
        res.status(500).json({ message: "Error al descargar la nota" });
    }
}

export async function enviarNota(req: Request, res: Response) {
    try {
        const nota = await NotaService.findById(Number(req.params.id));
        res.json(nota);
    } catch (error) {
        res.status(500).json({ message: "Error al enviar la nota" });
    }
}
