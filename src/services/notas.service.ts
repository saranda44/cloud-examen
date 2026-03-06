import { NotaDetalleModel } from "../models/nota.detalle.model";
import { NotaModel } from "../models/nota.model";
import { ProductoModel } from "../models/producto.model";
import { S3Client } from "@aws-sdk/client-s3";

export const NotaService = {
    findById,
    createNota,
    descargarPDF,
    enviarCorreo
};


//funcion para leer una nota por su id regresa un json
//nota, detalle, cliente, domicilios y productos
async function findById(id: number) {
    const result = await NotaModel.findById(id);
    return result;
}

// Metodo para crear una nota con sus detalles
//recibe un objeto nota con los datos principales y un arreglo de detalles con los productos y cantidades
async function createNota(nota: any, detalles: any[]) {
    // 1. Crear la nota base
    //total = 0 hasta que se creen los detalles
    nota.folio = `FOLIO-${Date.now()}`;
    const createdNota = await NotaModel.create(nota);
    const notaId = createdNota.id;

    let totalNota = 0; // Variable para ir acumulando el total

    // 2. Iterar sobre los detalles (producto_id y cantidad)
    for (const detalle of detalles) {
        detalle.nota_id = notaId;

        //obtener el precio unitario del producto
        const producto = await ProductoModel.findById(detalle.producto_id);
        if (!producto) {
            throw new Error("Producto no encontrado");
        }
        detalle.precio_unitario = producto.precio_base;

        // CALCULAR IMPORTE: cantidad x precio_unitario
        detalle.importe = detalle.cantidad * detalle.precio_unitario;

        // ACUMULAR AL TOTAL DE LA NOTA
        totalNota += detalle.importe;

        // Crear el registro del detalle en la DB
        await NotaDetalleModel.create(detalle);
    }

    // 3. Actualizar el total en la nota base
    await NotaModel.updateTotal(notaId, totalNota);

    // 4. Regresar la nota completa
    const notaCompleta = await NotaModel.findById(notaId);

    return notaCompleta;
}

// Método para endpoint de descarga
async function descargarPDF(id: number) {
    //obtener la nota

    //obtener el nombre del bucket (o obtenerlo del url) y el nombre del objeto (ponerlo en la url?)

    //obtener los metadatos del objeto

    //crear nuevos metadatos con nota-descargada: true

    //descargar el pdf y regresarlo (presigned url?)

}

// Método para endpoint de re-enviar
async function enviarCorreo(id: number) {
    //al llamar este endpoint se debe invocar la lambda sendEmail
}
