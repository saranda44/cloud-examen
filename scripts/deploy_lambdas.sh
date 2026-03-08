#!/bin/bash
set -e

echo "CREAR LAMBDAS"
export AWS_PAGER=cat

ECHO "Obten el ARN de LabRole del servicio IAM"
LAB_ROLE_ARN=$(aws iam get-role --role-name LabRole --query 'Role.Arn' --output text)

echo "CREAR LAMBDA DE NOTIFICACION DE NOTA CREADA"
aws lambda create-function \
  --function-name generatePDF \
  --runtime nodejs20.x \
  --role $LAB_ROLE_ARN \
  --handler generatePDF.handler \
  --zip-file fileb://lambda/build/generatePDF.zip

echo "Dar permiso a SNS de invocar la lambda 1"
aws lambda add-permission \
  --function-name generatePDF \
  --statement-id sns-trigger \
  --action lambda:InvokeFunction \
  --principal sns.amazonaws.com \
  --source-arn $TOPIC_ARN_NOTIFICATION

echo "Suscribir lambda 1 a ese SNS"
aws sns subscribe \
  --topic-arn $TOPIC_ARN_NOTIFICATION \
  --protocol lambda \
  --notification-endpoint $(aws lambda get-function \
      --function-name generatePDF \
      --query 'Configuration.FunctionArn' \
      --output text)

echo "CREAR LAMBDA PARA ENVIAR CORREO" 
aws lambda create-function \
  --function-name sendEmail \
  --runtime nodejs20.x \
  --role $LAB_ROLE_ARN \
  --handler sendEmail.handler \
  --zip-file fileb://lambda/build/sendEmail.zip


echo "Dar permiso a S3 para activar lambda 2"
aws lambda add-permission \
  --function-name sendEmail \
  --statement-id s3-trigger \
  --action lambda:InvokeFunction \
  --principal s3.amazonaws.com \
  --source-arn arn:aws:s3:::746458-esi3898k-examen1

echo "Obtener ARN de lambda 2"
SEND_EMAIL_FUNCTION_ARN=$(aws lambda get-function \
  --function-name sendEmail \
  --query 'Configuration.FunctionArn' \
  --output text)

echo "Crear configuración del evento en el bucket"
cat > notification.json <<EOF
{
  "LambdaFunctionConfigurations": [
    {
      "LambdaFunctionArn": "${SEND_EMAIL_FUNCTION_ARN}",
      "Events": ["s3:ObjectCreated:Put"]
    }
  ]
}
EOF

echo "Aplicar configuración al bucket"
aws s3api put-bucket-notification-configuration \
  --bucket 746458-esi3898k-examen1 \
  --notification-configuration file://notification.json


echo "------------------------------"
echo "Si necesitas actializar tus funciones"
echo "1. Volver a empaquetar"
echo "2. ./scripts/package_lambdas.sh"
echo "3. Actualizar lambda 1"
echo "aws lambda update-function-code \
    --function-name generatePDF \
    --zip-file fileb://lambda/build/generatePDF.zip"
echo "4. Actualizar lambda 2"
echo "aws lambda update-function-code \
    --function-name sendEmail \
    --zip-file fileb://lambda/build/sendEmail.zip"
echo "----------------------------------------"
