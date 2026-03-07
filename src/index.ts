import dotenv from "dotenv"
dotenv.config();
import express from "express"
import routes from "./routes/routes"
import { getDbPool } from "./database/connection";
const app = express()
const port = 8080

// Permitimos override de método HTTP usando ?_method=PUT en formularios
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// Rutas
app.use("/api", routes)

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`)
})

getDbPool().catch(err => {
  console.error("Fallo la conexión a la base de datos al inicio:", err);
});
