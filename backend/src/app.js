/**
 * Configuración Principal de la Aplicación Express
 * Define middlewares globales y rutas
 */

import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';

// Importar rutas (LIMPIADO DE DUPLICADOS)
import authRoutes from './routes/authRoutes.js';
import prestamosRoutes from './routes/prestamosRoutes.js';
import catalogoRoutes from './routes/catalogoRoutes.js';
import seccionesRoutes from './routes/seccionesRoutes.js';
import reservasRoutes from './routes/reservasRoutes.js';
import sancionesRoutes from './routes/sancionesRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';

// Crear la aplicación Express
const app = express();

// ===== MIDDLEWARES GLOBALES =====

// Middleware para parsear JSON
app.use(express.json());

// Middleware de CORS para comunicación con el frontend
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para loguear solicitudes (útil para debugging)
app.use((req, res, next) => {
  console.log(`\n📌 ${new Date().toLocaleTimeString()} - ${req.method} ${req.path}`);
  if (Object.keys(req.body).length > 0) {
    console.log(`   Body:`, req.body);
  }
  next();
});

// ===== RUTAS DE LA API =====

app.use('/api/auth', authRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/sanciones', sancionesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/secciones', seccionesRoutes); // UNA SOLA VEZ, COMO DEBE SER

// ===== RUTA DE PRUEBA =====

app.get('/', (req, res) => {
  return res.status(200).json({
    mensaje: 'Bienvenido al Backend del Sistema de Gestión de Equipos (SGE)',
    version: '1.0.0',
    estado: 'Funcionando'
  });
});

// ===== MANEJO DE RUTAS NO ENCONTRADAS =====

app.use((req, res) => {
  return res.status(404).json({
    exito: false,
    mensaje: `Ruta no encontrada: ${req.method} ${req.path}`,
    codigo: 'RUTA_NO_ENCONTRADA'
  });
});

// ===== MANEJO DE ERRORES GLOBAL =====

app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  
  return res.status(500).json({
    exito: false,
    mensaje: 'Error interno del servidor',
    error: config.nodeEnv === 'development' ? error.message : 'Error desconocido'
  });
});

export default app;