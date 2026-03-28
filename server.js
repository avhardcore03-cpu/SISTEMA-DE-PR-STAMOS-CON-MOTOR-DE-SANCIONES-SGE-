import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let inventario = [
  { id: 1, nombre: "Laptop", cantidad: 5 },
  { id: 2, nombre: "Mouse", cantidad: 10 }
];

app.get("/inventario", (req, res) => {
  res.json(inventario);
});

app.post("/inventario", (req, res) => {
  inventario.push(req.body);
  res.json(req.body);
});

app.listen(3001, () => {
  console.log("🔥 Servidor corriendo en http://localhost:3001");
});