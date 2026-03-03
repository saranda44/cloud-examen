import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

pool.query('SELECT NOW()').then((res) => {
  console.log('Conexión exitosa a la base de datos');
}).catch((err) => {
  console.error('Error al conectar a la base de datos:', err);
});

export default pool;