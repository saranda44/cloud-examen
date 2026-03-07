import { S3Client, HeadObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";
import { SNSClient, PublishCommand, SubscribeCommand, UnsubscribeCommand } from "@aws-sdk/client-sns";
import { S3Event } from 'aws-lambda';

const s3Client = new S3Client({});
const snsClient = new SNSClient({});

const API_URL = "http://98.93.37.76:8080/api";
const SNS_TOPIC_ARN_EMAIL = 'arn:aws:sns:us-east-1:733249732922:sendEmail-examen1-nube';

export async function handler(event: S3Event) {
    let bucketName = "";
    let objectKey = "";

    try {
        // 1. obtener el nombre del bucket y el nombre del objeto
        const record = event.Records[0];
        bucketName = record.s3.bucket.name;
        objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

        if (!bucketName || !objectKey) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "No se proporcionó bucketName ni objectKey." })
            };
        }

        // 2. Obtener los metadatos actuales del objeto en S3
        //funcion HeadObjectCommand para obtener los metadatos del objeto
        const headData = await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: objectKey }));
        const currentMetadata = headData.Metadata || {};

        // 3. Actualizar metadatos
        // el metadato veces-enviado deberá incrementarse en 1 y la hora-envío deberá actualizarse
        let vecesEnviado = Number(currentMetadata['veces-enviado'] || "0");
        vecesEnviado += 1;

        const newMetadata = {
            ...currentMetadata,
            'hora-envio': new Date().toISOString(),
            'veces-enviado': vecesEnviado.toString()
        };

        // para editar metadatos copiar el objeto sobre sí mismo con MetadataDirective="REPLACE"
        const command = new CopyObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
            CopySource: `${bucketName}/${objectKey}`,
            MetadataDirective: "REPLACE",
            Metadata: newMetadata
        });
        await s3Client.send(command);

        // 4. Enviar correo por SNS
        // leer el rfc y folio de la metadata
        const rfc = currentMetadata['rfc'];
        const folio = currentMetadata['folio'];
        const downloadLink = `${API_URL}/notas/${rfc}/${folio}/descargar`;

        const snsMessage = `Hola,\n\nSe ha generado y/o enviado la nota de tu compra.\nPuedes descargarla en el siguiente enlace:\n\n${downloadLink}\n\nGracias.`;

        // publicar el mensaje
        await snsClient.send(new PublishCommand({
            TopicArn: SNS_TOPIC_ARN_EMAIL,
            Subject: `Tu Nota está lista para descargar`,
            Message: snsMessage
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Notificación procesada y metadatos actualizados",
                vecesEnviado
            })
        };

    } catch (error) {
        console.error("Error en sendEmail:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error procesando envío y actualización", error: String(error) })
        };
    }
};
