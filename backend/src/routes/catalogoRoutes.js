/**
 * Rutas de Catálogo
 * Define los endpoints para obtener equipos disponibles
 */

import express from 'express';
import { obtenerCatalogo, obtenerEquipoPorId } from '../controllers/catalogoController.js';

const router = express.Router();

/**
 * GET /api/catalogo
 * ojo aqui está el Endpoint para obtener todos los equipos disponibles
 * No requiere autenticación (es acceso público)
 */
router.get('/', obtenerCatalogo);

/**
 * GET /api/catalogo/:id
 * Endpoint para obtener un equipo específico por su ID
 * No requiere autenticación
 */
router.get('/:id', obtenerEquipoPorId);

export default router;