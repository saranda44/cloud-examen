#!/bin/bash
set -e

echo "PRIMERO CREO MI SERVICIOS BASE"
export AWS_PAGER=cat

echo "CREAR S3"
aws s3 mb s3://746458-esi3898k-examen1 --region us-east-1

echo "CREAR SECRETOS DE USUARIO"
aws secretsmanager create-secret \
  --name examen1-nube-db-user \
  --description "Usuario de la base de datos examne1_nube" \
  --secret-string '{"username":"postgres"}' \
  --region us-east-1

echo "CREAR SECRETO DE PASSWORD"
aws secretsmanager create-secret \
  --name examen1-nube-db-password \
  --description "Password de la base de datos examen1_nube" \
  --secret-string '{"password":"database123"}' \
  --region us-east-1


echo "CREAR VPC DEFAULT"
VPCID=$(aws ec2 describe-vpcs \
  --filters Name=isDefault,Values=true \
  --query "Vpcs[0].VpcId" \
  --output text)

echo "CREAR SECURITY GROUP PARA EC2"
SGEC2=$(aws ec2 create-security-group \
  --group-name examen1-nube-ec2-sg \
  --description "SG for examen1 nube EC2" \
  --vpc-id $VPCID \
  --query GroupId \
  --output text)

echo "PERMITIR ACCESO A INSTANCIA DE EC2 CON SSH"
aws ec2 authorize-security-group-ingress \
  --group-id $SGEC2 \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

echo "PERMITOR ACCESO DESDE PUERO 8080"
aws ec2 authorize-security-group-ingress \
  --group-id $SGEC2 \
  --protocol tcp --port 8080 \
  --cidr 0.0.0.0/0 \
  --region us-east-1

echo "CREAR SECURITY GROUP PARA RDS"
SGRDS=$(aws ec2 create-security-group \
  --group-name examen1-nube-rds-sg \
  --description "SG for examen1 RDS" \
  --vpc-id $VPCID \
  --query GroupId \
  --output text)

echo "PERMITIR ACCESO A RDS SOLO DESDE NUESTRA INSTANCIA DE EC2"
aws ec2 authorize-security-group-ingress \
  --group-id $SGRDS \
  --source-group $SGEC2 \
  --protocol tcp \
  --port 5432


echo "CREAR RDS"
aws rds create-db-instance \
  --db-instance-identifier examen1-nube-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15 \
  --allocated-storage 20 \
  --master-username postgres \
  --master-user-password database123 \
  --db-name examen1_nube \
  --vpc-security-group-ids $SGRDS \
  --no-publicly-accessible \
  --region us-east-1

echo "ESPERAR A QUE RDS ESTE DISPONIBLE"
aws rds wait db-instance-available \
  --db-instance-identifier examen1-nube-db \
  --region us-east-1

echo "GUARDAR ENDPOINT DE RDS"
RDSHOST=$(aws rds describe-db-instances \
  --db-instance-identifier examen1-nube-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo "CREAR KEY PAIR PARA EC2"
aws ec2 create-key-pair \
  --key-name Examen1NubeKey \
  --query 'KeyMaterial' \
  --output text > Examen1NubeKey.pem \
  --region us-east-1

chmod 400 Examen1NubeKey.pem

echo "CORRER INSTANCIAS DE EC2"
aws ec2 run-instances \
  --image-id ami-0532be01f26a3de55 \
  --count 1 \
  --instance-type t3.micro \
  --key-name Examen1NubeKey \
  --security-group-ids $SGEC2 \
  --iam-instance-profile Name=LabInstanceProfile \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=examen1-nube}]"

echo "ESPERAR A QUE EC2 ESTE CORRIENDO"
aws ec2 wait instance-running \
  --filters "Name=tag:Name,Values=examen1-nube"

EC2IP=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=examen1-nube" \
  --query 'Reservations[].Instances[].PublicIpAddress' \
  --output text)

echo "EC2 IP: $EC2IP"

echo "CREAR SNS SEND_EMAIL"
TOPIC_ARN_EMAIL=$(aws sns create-topic \
  --name sendEmail-examen1-nube \
  --query TopicArn --output text)

echo "CREAR SNS NOTE_CREATED"
TOPIC_ARN_NOTIFICATION=$(aws sns create-topic \
  --name noteCreated-examen1-nube \
  --query TopicArn --output text)

##obtener ARN de SNS
TOPIC_ARN_EMAIL=$(aws sns list-topics \
  --query "Topics[?contains(TopicArn,'sendEmail-examen1-nube')].TopicArn" \
  --output text)

TOPIC_ARN_NOTIFICATION=$(aws sns list-topics \
  --query "Topics[?contains(TopicArn,'noteCreated-examen1-nube')].TopicArn" \
  --output text)


echo "------------------------"
echo "CREA TUS FUNCIONES LAMBDA"
echo "1. chmod +x scripts/package_lambdas.sh"
echo "2. ./scripts/package_lambdas.sh"
echo "3. Ejecutar script de deploy de lambdas"
echo "-----------------------------"
