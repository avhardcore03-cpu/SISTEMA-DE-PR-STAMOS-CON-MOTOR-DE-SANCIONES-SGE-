import { Router } from 'express';
import { asignarStrike } from '../controllers/usuariosController.js';

const router = Router();

// PUT /api/usuarios/:id/strike - Asignar strike manual a un usuario
router.put('/:id/strike', asignarStrike);

export default router;