import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// --- BASES DE DATOS SIMULADAS ---
let inventario = [
  { id: 1, nombre: "Laptop", cantidad: 5 },
  { id: 2, nombre: "Mouse", cantidad: 10 }
];

let prestamos = [];

// RUTAS DE INVENTARIO
app.get("/inventario", (req, res) => {
  res.json(inventario);
});

// RUTA PARA CREAR PRÉSTAMO
app.post("/prestamos", (req, res) => {
  const { productoId, usuario, cantidad } = req.body;

  // Convertimos a número para estar 100% seguros
  const idNumerico = Number(productoId);
  const cantidadNumerica = Number(cantidad);

  const producto = inventario.find(item => item.id === idNumerico);

  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado en el inventario" });
  }

  if (producto.cantidad < cantidadNumerica) {
    return res.status(400).json({ error: "No hay suficiente stock" });
  }

  // Restar stock
  producto.cantidad -= cantidadNumerica;

  const nuevoPrestamo = {
    id: Date.now(),
    productoId: idNumerico,
    productoNombre: producto.nombre,
    usuario: usuario,
    cantidad: cantidadNumerica
  };
  
  prestamos.push(nuevoPrestamo);
  res.status(201).json(nuevoPrestamo);
});

// RUTA PARA OBTENER PRÉSTAMOS
app.get("/prestamos", (req, res) => {
  res.json(prestamos);
});

// RUTA PARA DEVOLVER (ELIMINAR) Y RESTAURAR STOCK
app.delete("/prestamos/:id", (req, res) => {
  const prestamoId = Number(req.params.id);
  
  const prestamoIndex = prestamos.findIndex(p => p.id === prestamoId);

  if (prestamoIndex === -1) {
    return res.status(404).json({ error: "El préstamo ya no existe en el servidor" });
  }

  const prestamo = prestamos[prestamoIndex];

  // Devolver el stock al producto original
  const producto = inventario.find(item => item.id === prestamo.productoId);
  if (producto) {
    producto.cantidad += prestamo.cantidad;
  }

  // Eliminar de la lista
  prestamos.splice(prestamoIndex, 1);
  
  res.status(200).json({ mensaje: "Devolución exitosa" });
});

app.listen(3001, () => {
  console.log("🔥 Servidor listo en http://localhost:3001");
});