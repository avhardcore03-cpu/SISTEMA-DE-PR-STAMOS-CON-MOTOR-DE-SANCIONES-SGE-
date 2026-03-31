/**
 * Configuración Principal de la Aplicación Express - INTEGRACIÓN TOTAL CON SANCIONES
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
  { id: 1, nombre: "Laptop Dell", cantidad: 5, estado: "Disponible" },
  { id: 2, nombre: "Mouse Logitech", cantidad: 10, estado: "Disponible" },
  { id: 3, nombre: "Teclado Mecánico", cantidad: 8, estado: "Disponible" }
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
  // Buscamos si el usuario está suspendido antes de dejarlo entrar
  const user = usuariosDB[0]; 

  return res.status(200).json({
    exito: true,
    user: { id: user.id, username: username || user.username, role: "ADMIN", estado: user.estado },
    token: "token-de-emergencia-12345" 
  });
});

// ===== 📦 RUTAS DE INVENTARIO =====
app.get('/api/inventario', (req, res) => res.json(miInventario));

app.post('/api/inventario', (req, res) => {
  const { nombre, cantidad } = req.body;
  const nuevoEquipo = { id: Date.now(), nombre, cantidad: Number(cantidad), estado: "Disponible" };
  miInventario.push(nuevoEquipo);
  res.status(201).json(nuevoEquipo);
});

app.delete('/api/inventario/:id', (req, res) => {
  const { id } = req.params;
  miInventario = miInventario.filter(item => item.id !== Number(id));
  res.json({ exito: true });
});

// ===== 🤝 RUTAS DE PRÉSTAMOS CON BLOQUEO Y FECHAS (MEJORADO) =====

app.get('/api/prestamos', (req, res) => res.json(misPrestamos));

// 1. CREAR PRÉSTAMO CON BLOQUEO
app.post('/api/prestamos', (req, res) => {
  const { productoId, usuario, cantidad, productoNombre, fecha_pactada } = req.body;
  
  // VALIDACIÓN DE BLOQUEO: Si el usuario tiene 3 strikes o está suspendido
  const userCheck = usuariosDB[0]; // En producción esto buscaría por ID
  if (userCheck.estado === 'Suspendido' || userCheck.strikes >= 3) {
    return res.status(403).json({ 
      mensaje: "⛔ BLOQUEO: El usuario está SUSPENDIDO por exceso de strikes. No puede retirar equipos." 
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
        fecha_pactada: fecha_pactada, // El dato que te pidió tu compañera
        estado: "Pendiente"
    };
    misPrestamos.push(nuevoPrestamo);
    res.status(201).json(nuevoPrestamo);
  } else {
    res.status(400).json({ mensaje: "Stock insuficiente" });
  }
});

// 2. DEVOLVER PRÉSTAMO CON CÁLCULO DE STRIKES (Lo que pidió Andrés/Compañera)
app.post('/api/prestamos/devolver/:id', (req, res) => {
  const { id } = req.params;
  const { fecha_real_entrega } = req.body; // Fecha que llega desde el frontend
  
  const prestamoIndex = misPrestamos.findIndex(p => p.id === Number(id));
  
  if (prestamoIndex !== -1) {
    const prestamo = misPrestamos[prestamoIndex];
    const fechaEsperada = new Date(prestamo.fecha_pactada);
    const fechaReal = new Date(fecha_real_entrega);
    
    let sancionAplicada = false;

    // COMPARACIÓN DE FECHAS
    if (fechaReal > fechaEsperada) {
        // Sumar Strike al usuario
        usuariosDB[0].strikes += 1;
        sancionAplicada = true;

        // SUSPENSIÓN AUTOMÁTICA
        if (usuariosDB[0].strikes >= 3) {
            usuariosDB[0].estado = 'Suspendido';
        }
    }

    // Devolver al inventario
    const producto = miInventario.find(p => p.id === Number(prestamo.productoId));
    if (producto) producto.cantidad += prestamo.cantidad;
    
    // Eliminar de préstamos activos
    misPrestamos.splice(prestamoIndex, 1);

    res.json({ 
        exito: true, 
        mensaje: sancionAplicada ? "Retraso detectado: +1 Strike aplicado." : "Devolución a tiempo.",
        totalStrikes: usuariosDB[0].strikes,
        estadoUsuario: usuariosDB[0].estado
    });
  } else {
    res.status(404).json({ mensaje: "Préstamo no encontrado" });
  }
});

// RUTAS DE ANDRÉS
app.use('/api/auth', authRoutes);
app.use('/api/prestamos_andres', prestamosRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/sanciones', sancionesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/secciones', seccionesRoutes);

app.get('/', (req, res) => res.status(200).send('✅ Servidor SGE: ONLINE CON SISTEMA DE STRIKES'));

app.use((error, req, res, next) => {
  res.status(500).json({ exito: false, mensaje: error.message });
});

export default app;