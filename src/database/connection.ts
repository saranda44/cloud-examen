import { Pool } from 'pg';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// Crear cliente a Secrets Manager
const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });

let pool: Pool | null = null;

export async function getDbPool() {
  try {
    // Obtener nombre de usuario de la base de datos
    const userSecretResponse = await secretsClient.send(
      new GetSecretValueCommand({ SecretId: 'examen1-nube-db-user' })
    ); //obtenemos el secreto
    const { username } = JSON.parse(userSecretResponse.SecretString || '{}'); //extraemos el nombre de usuario del secreto

    // Obtener contraseña de la base de datos
    const passwordSecretResponse = await secretsClient.send(
      new GetSecretValueCommand({ SecretId: 'examen1-nube-db-password' })
    );
    const { password } = JSON.parse(passwordSecretResponse.SecretString || '{}');

    // Obtener host de la base de datos
    const rdsHost = process.env.RDS_HOST || "";

    pool = new Pool({
      host: rdsHost,
      user: username,
      password: password,
      database: 'examen1_nube',
      port: 5432,
      max: 20, // número máximo de conexiones
      idleTimeoutMillis: 30000, // tiempo de espera antes de cerrar la conexión
      connectionTimeoutMillis: 2000, // tiempo de espera antes de intentar una nueva conexión
      ssl: {
        rejectUnauthorized: false // Desactiva la validación estricta del certificado
      }
    });

    const res = await pool.query('SELECT NOW()');
    console.log('Conexión exitosa a la base de datos RDS:', res.rows[0].now);

    return pool;
  } catch (error) {
    console.error('Error al conectar a la base de datos RDS:', error);
    throw error;
  }
};