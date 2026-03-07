import { SNSClient, PublishCommand, SubscribeCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
    region: "us-east-1",
});

export async function noteCreated(notaId: number) {
    const command = new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN_NOTIFICATION,
        Message: JSON.stringify({
            eventType: "NOTA_CREATED",
            notaId: notaId
        })
    });
    return await snsClient.send(command);
}

export async function suscribirCliente(email: string) {
    const command = new SubscribeCommand({
        TopicArn: process.env.SNS_TOPIC_ARN_NOTIFICATION,
        Protocol: "email",
        Endpoint: email
    });
    return await snsClient.send(command);
}
