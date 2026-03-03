import express, { static as static_} from "express"
import path from "path"
import routes from "./routes/routes"

const app = express()
const port = 8080

// Permitimos override de método HTTP usando ?_method=PUT en formularios
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Rutas
app.use("/api", routes)

// Servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`)
})
