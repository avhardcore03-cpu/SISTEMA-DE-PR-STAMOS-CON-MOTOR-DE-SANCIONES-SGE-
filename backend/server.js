/**
 * Servidor Principal del Backend - Sistema de Gestión de Equipos (SGE)
 * 
 * Stack:
 * - Node.js con Express
 * - JWT para autenticación
 * - Base de datos simulada en memoria (arrays/objetos)
 * 
 * Autor: Desarrollador Backend Senior
 * Descripción: Backend modularizado con autenticación y motor de sanciones
 */

import app from './src/app.js';
import { config } from './src/config/config.js';

// Iniciar el servidor
const servidor = app.listen(config.puerto, () => {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        SISTEMA DE GESTIÓN DE EQUIPOS (SGE)                 ║');
  console.log('║              Backend iniciado correctamente                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`🚀 Servidor ejecutándose en: http://localhost:${config.puerto}`);
  console.log(`🌍 Frontend esperado en: ${config.frontendUrl}`);
  console.log(`📝 Ambiente: ${config.nodeEnv}`);
  console.log(`🔐 JWT Expira en: ${config.jwtExpire}\n`);
  
  console.log('📚 Endpoints disponibles:');
  console.log('   POST   /api/auth/login                - Iniciar sesión');
  console.log('   GET    /api/auth/perfil               - Obtener perfil (requiere token)');
  console.log('   GET    /api/auth/validar-token        - Validar token (requiere token)');
  console.log('   POST   /api/prestamos/devolver        - Devolver equipo (nuclear de sanciones)');
  console.log('   GET    /api/prestamos/usuario/:id     - Obtener préstamos del usuario');
  console.log('   GET    /api/prestamos/pendientes      - Obtener préstamos pendientes (supervisor)');
  console.log('   GET    /api/prestamos/:id_prestamo    - Obtener detalle del préstamo\n');
  console.log('   GET    /api/sanciones/dashboard       - Dashboard de sanciones');
  console.log('   GET    /api/sanciones                 - Listar sancionados');
  console.log('   POST   /api/sanciones/actualizar      - Actualizar sanciones (nuclear)');
  console.log('   PUT    /api/sanciones/perdonar/:id    - Perdonar sanciones de un usuario\n');
  console.log('   GET    /api/catalogo                  - Listar equipos disponibles (público)');
  console.log('   GET    /api/catalogo/:id              - Detalle de equipo por ID (público)\n');
  console.log('   CRUD   /api/inventario               - Gestión de inventario (admin)\n');
});

// Manejo de señales para shutdown limpio
process.on('SIGTERM', () => {
  console.log('\n⚠️  Señal SIGTERM recibida. Cerrando servidor...');
  servidor.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  Servidor interrumpido por el usuario');
  servidor.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rechazada no manejada:', reason);
  process.exit(1);
});