import { Pool, Client } from 'pg';

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

//cuando use RDS
// const client = new Client({
//   host: process.env.RDS_HOST,
//   user: process.env.RDS_USER,
//   password: process.env.RDS_PASSWORD,
//   database: process.env.RDS_DB_NAME,
//   port: 5432,
// });

pool.query('SELECT NOW()').then((res) => {
  console.log('Conexión exitosa a la base de datos');
}).catch((err) => {
  console.error('Error al conectar a la base de datos:', err);
});

export default pool;