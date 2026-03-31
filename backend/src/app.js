/**
 * Configuración Principal de la Aplicación Express - INTEGRACIÓN TOTAL CON SANCIONES
 * FIX: CRUD DE INVENTARIO (PUT) Y LÓGICA DE STRIKES
 */

import express from 'express'; 
import cors from 'cors';
import { config } from './config/config.js';

import authRoutes from './routes/authRoutes.js';
import prestamosRoutes from './routes/prestamosRoutes.js';
import catalogoRoutes from './routes/catalogoRoutes.js';
import seccionesRoutes from './routes/seccionesRoutes.js';
import reservasRoutes from './routes/reservasRoutes.js';
import sancionesRoutes from './routes/sancionesRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';

const app = express(); 

// ===== DATOS EN MEMORIA ACTUALIZADOS =====
let miInventario = [
  { id: 1, nombre: "Laptop Dell", categoria: "Laptops", cantidad: 5, estado: "Disponible" },
  { id: 2, nombre: "Mouse Logitech", categoria: "Periféricos", cantidad: 10, estado: "Disponible" },
  { id: 3, nombre: "Teclado Mecánico", categoria: "Periféricos", cantidad: 8, estado: "Disponible" }
];

let misPrestamos = [];

// Simulamos una base de usuarios para controlar los Strikes y el Bloqueo
let usuariosDB = [
  { id: 1, username: "EstudiantePrueba", strikes: 0, estado: "Activo" }
];

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(`\n📡 Solicitud: ${req.method} ${req.path}`);
  next();
});

// ===== 🔑 LOGIN HÍBRIDO =====
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body;
  const user = usuariosDB[0]; 

  return res.status(200).json({
    exito: true,
    user: { id: user.id, username: username || user.username, role: "ADMIN", estado: user.estado },
    token: "token-de-emergencia-12345" 
  });
});

// ===== 📦 RUTAS DE INVENTARIO (CRUD COMPLETO) =====

app.get('/api/inventario', (req, res) => res.json(miInventario));

// 1. CREAR (POST)
app.post('/api/inventario', (req, res) => {
  const { nombre, categoria, cantidad } = req.body;
  const nuevoEquipo = { 
    id: Date.now(), 
    nombre, 
    categoria: categoria || "General", 
    cantidad: Number(cantidad), 
    estado: "Disponible" 
  };
  miInventario.push(nuevoEquipo);
  res.status(201).json(nuevoEquipo);
});

// 2. ACTUALIZAR (PUT) - ¡ESTO ERA LO QUE TE FALTABA!
app.put('/api/inventario/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, cantidad } = req.body;
  
  const indice = miInventario.findIndex(item => item.id === Number(id));

  if (indice !== -1) {
    miInventario[indice] = {
      ...miInventario[indice],
      nombre: nombre || miInventario[indice].nombre,
      categoria: categoria || miInventario[indice].categoria,
      cantidad: Number(cantidad)
    };
    console.log(`✅ Equipo ID ${id} actualizado correctamente`);
    res.json(miInventario[indice]);
  } else {
    res.status(404).json({ mensaje: "Equipo no encontrado" });
  }
});

// 3. ELIMINAR (DELETE)
app.delete('/api/inventario/:id', (req, res) => {
  const { id } = req.params;
  miInventario = miInventario.filter(item => item.id !== Number(id));
  res.json({ exito: true });
});

// ===== 🤝 RUTAS DE PRÉSTAMOS CON BLOQUEO Y FECHAS =====

app.get('/api/prestamos', (req, res) => res.json(misPrestamos));

app.post('/api/prestamos', (req, res) => {
  const { productoId, usuario, cantidad, productoNombre, fecha_pactada } = req.body;
  
  const userCheck = usuariosDB[0]; 
  if (userCheck.estado === 'Suspendido' || userCheck.strikes >= 3) {
    return res.status(403).json({ 
      mensaje: "⛔ BLOQUEO: El usuario está SUSPENDIDO por exceso de strikes." 
    });
  }

  const producto = miInventario.find(p => p.id === Number(productoId));

  if (producto && producto.cantidad >= cantidad) {
    producto.cantidad -= cantidad; 
    const nuevoPrestamo = { 
        id: Date.now(), 
        productoId, 
        productoNombre, 
        usuario, 
        cantidad,
        fecha_salida: new Date().toISOString().split('T')[0],
        fecha_pactada: fecha_pactada, 
        estado: "Pendiente"
    };
    misPrestamos.push(nuevoPrestamo);
    res.status(201).json(nuevoPrestamo);
  } else {
    res.status(400).json({ mensaje: "Stock insuficiente" });
  }
});

// DEVOLVER CON CÁLCULO DE STRIKES
app.post('/api/prestamos/devolver/:id', (req, res) => {
  const { id } = req.params;
  const { fecha_real_entrega } = req.body; 
  
  const prestamoIndex = misPrestamos.findIndex(p => p.id === Number(id));
  
  if (prestamoIndex !== -1) {
    const prestamo = misPrestamos[prestamoIndex];
    
    // Normalizamos fechas para comparar solo año-mes-día
    const fechaEsperada = new Date(prestamo.fecha_pactada + "T00:00:00");
    const fechaReal = new Date(fecha_real_entrega + "T00:00:00");
    
    let mensaje = "Devolución a tiempo.";

    if (fechaReal > fechaEsperada) {
        usuariosDB[0].strikes += 1;
        mensaje = `⚠️ RETRASO: Strike #${usuariosDB[0].strikes} aplicado.`;

        if (usuariosDB[0].strikes >= 3) {
            usuariosDB[0].estado = 'Suspendido';
            mensaje += " Usuario SUSPENDIDO automáticamente.";
        }
    }

    const producto = miInventario.find(p => p.id === Number(prestamo.productoId));
    if (producto) producto.cantidad += prestamo.cantidad;
    
    misPrestamos.splice(prestamoIndex, 1);

    res.json({ exito: true, mensaje });
  } else {
    res.status(404).json({ mensaje: "Préstamo no encontrado" });
  }
});

// RUTAS COMPLEMENTARIAS
app.use('/api/auth', authRoutes);
app.use('/api/prestamos_andres', prestamosRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/sanciones', sancionesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/secciones', seccionesRoutes);

app.get('/', (req, res) => res.status(200).send('✅ Servidor SGE: ONLINE CON SISTEMA DE STRIKES Y CRUD'));

app.use((error, req, res, next) => {
  res.status(500).json({ exito: false, mensaje: error.message });
});

export default app;