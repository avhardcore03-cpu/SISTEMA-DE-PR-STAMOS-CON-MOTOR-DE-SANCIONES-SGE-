import express from 'express';
import {
  crearReserva,
  obtenerReservasPendientes,
  aprobarReserva,
  cancelarReserva
} from '../controllers/reservasController.js';

// NOTA: Si usas un middleware para verificar el token (ej. authMiddleware), 
// impórtalo aquí y agrégalo en las rutas. Por ahora las dejo directas para evitar más errores de importación.

const router = express.Router();

// Estudiante: Crea la reserva
router.post('/crear', crearReserva);

// Admin: Ve las reservas pendientes
router.get('/pendientes', obtenerReservasPendientes);

// Admin: Entrega el equipo (aprueba)
router.put('/:id_reserva/aprobar', aprobarReserva);

// Admin: Cancela porque el estudiante no fue
router.put('/:id_reserva/cancelar', cancelarReserva);

export default router;