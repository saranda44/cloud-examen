import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { SNSEvent } from 'aws-lambda';

import PDFDocument from "pdfkit";

const API_URL = "http://100.54.9.146:8080/api";
const expediente = "647458";

// Cliente de S3 (toma las credenciales del entorno de ejecución Lambda o variables de entorno locales)
const s3Client = new S3Client({});

export async function handler(event: SNSEvent) {
    try {
        // 1. Obtener ID de la nota desde el evento SNS
        const message = JSON.parse(event.Records[0].Sns.Message);
        const notaId = message.notaId;

        //hacer la peticion a la API
        const response = await fetch(`${API_URL}/notas/${notaId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        //guardar lo que regresa la API
        const data = await response.json();
        const nota = data;
        const cliente = data.cliente;
        const detalles = data.detalle;

        // 2. Crear PDF
        //crear el buffer
        const doc = new PDFDocument();
        const buffers: Buffer[] = []

        doc.on('data', (chunk) => buffers.push(chunk))

        const pdfBuffer: Buffer = await new Promise((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(buffers))
            })
            // Título
            doc.fontSize(20).text('Nota de Venta', { align: 'center' });
            doc.moveDown();

            // Información del Cliente (Razón Social, Nombre Comercial, RFC, Correo electrónico, Teléfono)
            doc.fontSize(14).text('Información del Cliente');
            doc.fontSize(12).text(`Razón Social: ${cliente.razon_social}`);
            doc.fontSize(12).text(`Nombre Comercial: ${cliente.nombre_comercial}`);
            doc.text(`RFC: ${cliente.rfc}`);
            doc.text(`Correo electrónico: ${cliente.correo}`);
            doc.text(`Teléfono: ${cliente.telefono}`);
            doc.moveDown();

            // Información de la Nota (Folio)
            doc.fontSize(14).text('Información de la Nota');
            doc.fontSize(12).text(`Folio: ${nota.folio}`);
            doc.moveDown();

            // Contenido (cantidad, nombre del producto, precio unitario, importe)
            doc.fontSize(14).text('Contenido de la nota');
            doc.moveDown();
            if (detalles) {
                detalles.forEach((det: any, index: number) => {
                    const nombreProducto = det.producto;
                    doc.fontSize(10).text(`${index + 1}. Producto: ${nombreProducto}`);
                    doc.text(`   Cantidad: ${det.cantidad} | Precio Unitario: $${det.precio_unitario} | Importe: $${det.importe}`);
                    doc.moveDown(0.5);
                });
                doc.moveDown();
            }

            doc.fontSize(12).text(`TOTAL IMPORTE: $${nota.total}`);

            doc.end();
        });

        // 3. Subir a S3
        // El bucket deberá llamarse {expediente}-esi3898k-examen1 
        // y el nombre del objeto deberá ser {rfcCliente}/{folioNota}.pdf
        const bucketName = `${expediente}-esi3898k-examen1`;
        const objectKey = `${cliente.rfc}/${nota.folio}.pdf`;

        // 4. Metadatos (hora-envío, nota-descargada, veces-enviado, nota-id)
        const putCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
            Metadata: {
                'hora-envio': new Date().toISOString(),
                'nota-descargada': 'false',
                'veces-enviado': '1',
                // Guardamos el ID de la base de datos para la URL de descarga
                'nota-id': String(notaId || nota?.id || '')
            }
        });

        await s3Client.send(putCommand);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "PDF guardado en S3",
                bucket: bucketName,
                key: objectKey
            })
        };

    } catch (error) {
        console.error("Error generando o subiendo PDF:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error interno al generar PDF", error: String(error) })
        };
    }
};


