import dotenv from "dotenv"
dotenv.config();
import express from "express"
import routes from "./routes/routes"
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

