/**
 * Rutas de Autenticación
 * Define los endpoints para login y manejo de autenticación
 */

import express from 'express';
import { login, obtenerPerfil, validarToken, obtenerUsuario, asignarStrikeUsuario } from '../controllers/authController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Endpoint para que los usuarios inicien sesión
 * Recibe: { email, password }
 * Devuelve: { token, usuario, estado, strikes, equipoRetenido }
 */
router.post('/login', login);

/**
 * GET /api/auth/perfil
 * Endpoint para obtener los datos del usuario autenticado
 * Requiere: Token JWT válido en header Authorization
 */
router.get('/perfil', verificarToken, obtenerPerfil);

/**
 * GET /api/auth/validar-token
 * Endpoint para validar si un token es válido
 * Útil para frontend para verificar si la sesión está activa
 * Requiere: Token JWT válido en header Authorization
 */
router.get('/validar-token', verificarToken, validarToken);

/**
 * GET /api/usuarios/:id
 * Endpoint para obtener datos públicos de un usuario por su ID
 * No requiere autenticación
 */
router.get('/usuarios/:id', obtenerUsuario);

/**
 * PUT /api/usuarios/:id/strike
 * Asigna un strike a un usuario (solo para ADMIN)
 * Si alcanza 3 strikes, se suspende automáticamente
 * Requiere: Token JWT válido (admin) en header Authorization
 */
router.put('/usuarios/:id/strike', verificarToken, asignarStrikeUsuario);

export default router;
