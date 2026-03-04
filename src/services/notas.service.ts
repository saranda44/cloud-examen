import { NotaDetalleModel } from "../models/nota.detalle.model";
import { NotaModel } from "../models/nota.model";

export const NotaService = {
    findById,
    createNota,
};


//funcion para leer una nota por su id regresa un json
//nota, detalle, cliente, domicilios y productos
async function findById(id: number) {
    const result = await NotaModel.findById(id);
    return result;
}

// Función para crear una nota con sus detalles
//recibe un objeto nota con los datos principales y un arreglo de detalles con los productos y cantidades
async function createNota(nota: any, detalles: any[]) {
    // 1. Crear la nota maestra
    nota.folio = `FOLIO-${Date.now()}`;
    const createdNota = await NotaModel.create(nota);
    const notaId = createdNota.id;

    let totalNota = 0; // Variable para ir acumulando el total

    // 2. Iterar sobre los detalles
    for (const detalle of detalles) {
        detalle.nota_id = notaId;

        // CALCULAR IMPORTE: cantidad x precio_unitario
        detalle.importe = detalle.cantidad * detalle.precio_unitario;

        // ACUMULAR AL TOTAL DE LA NOTA
        totalNota += detalle.importe;

        // Crear el registro del detalle en la DB
        await NotaDetalleModel.create(detalle);
    }

    // 3. ACTUALIZAR EL TOTAL en la nota maestra
    await NotaModel.updateTotal(notaId, totalNota);
    createdNota.total = totalNota; // Opcional: para que se regrese en el JSON de respuesta

    return createdNota;
}
