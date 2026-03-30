/**
 * Rutas de Préstamos y Motor de Sanciones
 * Define los endpoints para devolver equipos y gestionar sanciones
 */

import express from 'express';
import {
  devolverEquipo,
  obtenerPrestamosDelUsuario,
  obtenerPrestamossPendientes,
  obtenerDetallePrestamo,
  solicitarEquipo,
  obtenerTodosPrestamosController,
  crearPrestamo,
  asignarStrikePrestamo
} from '../controllers/prestamosController.js';
import {
  verificarToken,
  verificarRol,
  verificarEstadoUsuario
} from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/prestamos/devolver
 * ENDPOINT PRINCIPAL DEL MOTOR DE SANCIONES
 * 
 * Devuelve un equipo y aplica las sanciones correspondientes
 * Requiere autenticación y que el usuario no esté suspendido
 * 
 * Body esperado:
 * {
 *   "id_prestamo": 101,
 *   "fecha_entrega_real": "2024-03-15"
 * }
 * 
 * Lógica:
 * 1. Buscar el préstamo
 * 2. Comparar fecha_esperada vs fecha_entrega_real
 * 3. Si hay retraso: +1 strike
 * 4. Si strikes >= 3: estado = "SUSPENDIDO"
 */
router.post('/devolver', verificarToken, verificarEstadoUsuario, devolverEquipo);

/**
 * GET /api/prestamos/usuario/:id_usuario
 * Obtiene todos los préstamos de un usuario específico
 * Requiere autenticación
 * 
 * Respuesta incluye:
 * - Datos del usuario (ID, nombre, rol, estado, strikes)
 * - Lista de todos sus préstamos (pendientes y devueltos)
 */
router.get('/usuario/:id_usuario', verificarToken, obtenerPrestamosDelUsuario);

/**
 * GET /api/prestamos/pendientes
 * Obtiene todos los préstamos pendientes del sistema
 * Requiere autenticación y rol de SUPERVISOR o ADMIN
 * Útil para supervisores que necesitan vista general
 */
router.get('/pendientes', verificarToken, verificarRol(['SUPERVISOR', 'ADMIN']), obtenerPrestamossPendientes);

/**
 * GET /api/prestamos/:id_prestamo
 * Obtiene el detalle completo de un préstamo
 * Incluye información del usuario asociado
 * Requiere autenticación
 */
router.get('/:id_prestamo', verificarToken, obtenerDetallePrestamo);

/**
 * POST /api/prestamos/solicitar
 * Permite a un estudiante solicitar un equipo
 * El equipo cambia de estado a "Prestado"
 * Se crea un préstamo en estado "PENDIENTE"
 * 
 * Body esperado:
 * {
 *   "id_usuario": 4,
 *   "id_equipo": 1
 * }
 */
router.post('/solicitar', solicitarEquipo);

/**
 * GET /api/prestamos
 * Obtiene todos los préstamos del sistema
 * Loguea alertas de préstamos vencidos
 */
router.get('/', verificarToken, obtenerTodosPrestamosController);

/**
 * POST /api/prestamos/crear
 * Crea un nuevo préstamo con validaciones
 * Calcula automáticamente la fecha de devolución (15 días hábiles)
 * Requiere autenticación de ADMIN
 * 
 * Body esperado:
 * {
 *   "id_usuario": 3,
 *   "id_equipo": 1,
 *   "fecha_prestamo": "2024-03-27"
 * }
 */
router.post('/crear', verificarToken, verificarRol(['ADMIN']), crearPrestamo);

/**
 * PUT /api/prestamos/:id/strike
 * Asigna un strike a un préstamo vencido
 * Solo funciona si la fecha actual > fecha_devolucion
 * Requiere autenticación de ADMIN
 */
router.put('/:id/strike', verificarToken, verificarRol(['ADMIN']), asignarStrikePrestamo);

export default router;
