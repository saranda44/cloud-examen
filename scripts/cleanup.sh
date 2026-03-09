#!/bin/bash
set -e

echo "ELIMINANDO RECURSOS"
export AWS_PAGER=cat

BUCKET="746458-esi3898k-examen1"

echo "OBTENER VPC DEFAULT"
VPCID=$(aws ec2 describe-vpcs \
  --filters Name=isDefault,Values=true \
  --query "Vpcs[0].VpcId" \
  --output text)

echo "OBTENER SECURITY GROUPS"
SGEC2=$(aws ec2 describe-security-groups \
  --filters Name=group-name,Values=examen1-nube-ec2-sg \
  --query "SecurityGroups[0].GroupId" \
  --output text)

SGRDS=$(aws ec2 describe-security-groups \
  --filters Name=group-name,Values=examen1-nube-rds-sg \
  --query "SecurityGroups[0].GroupId" \
  --output text)

echo "OBTENER SNS TOPICS"
TOPIC_EMAIL=$(aws sns list-topics \
  --query "Topics[?contains(TopicArn,'sendEmail-examen1-nube')].TopicArn" \
  --output text)

TOPIC_NOTIFICATION=$(aws sns list-topics \
  --query "Topics[?contains(TopicArn,'noteCreated-examen1-nube')].TopicArn" \
  --output text)


echo "QUITAR NOTIFICACIONES DE S3"
aws s3api put-bucket-notification-configuration \
  --bucket $BUCKET \
  --notification-configuration '{}'


echo "ELIMINAR LAMBDAS"
aws lambda delete-function --function-name generatePDF || true
aws lambda delete-function --function-name sendEmail || true


echo "ELIMINAR SNS TOPICS"
aws sns delete-topic --topic-arn $TOPIC_EMAIL || true
aws sns delete-topic --topic-arn $TOPIC_NOTIFICATION || true


echo "TERMINAR INSTANCIA EC2"

INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=examen1-nube" \
  --query "Reservations[].Instances[].InstanceId" \
  --output text)

aws ec2 terminate-instances --instance-ids $INSTANCE_ID || true

aws ec2 wait instance-terminated \
  --instance-ids $INSTANCE_ID || true


echo "ELIMINAR KEYPAIR"
aws ec2 delete-key-pair \
  --key-name Examen1NubeKey || true

rm -f Examen1NubeKey.pem


echo "ELIMINAR RDS"

aws rds delete-db-instance \
  --db-instance-identifier examen1-nube-db \
  --skip-final-snapshot || true

aws rds wait db-instance-deleted \
  --db-instance-identifier examen1-nube-db || true


echo "ELIMINAR SECURITY GROUPS"

aws ec2 delete-security-group \
  --group-id $SGRDS || true

aws ec2 delete-security-group \
  --group-id $SGEC2 || true


echo "ELIMINAR SECRETS"

aws secretsmanager delete-secret \
  --secret-id examen1-nube-db-user \
  --force-delete-without-recovery || true

aws secretsmanager delete-secret \
  --secret-id examen1-nube-db-password \
  --force-delete-without-recovery || true


echo "VACIAR Y ELIMINAR BUCKET S3"

aws s3 rm s3://$BUCKET --recursive || true
aws s3 rb s3://$BUCKET || true


echo "--------------------------------"
echo "TODOS LOS RECURSOS ELIMINADOS"
echo "--------------------------------"