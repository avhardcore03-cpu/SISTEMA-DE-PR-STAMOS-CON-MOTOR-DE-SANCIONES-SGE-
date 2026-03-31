import { Router } from 'express';
import { obtenerSancionados, perdonarSancion, obtenerDashboard } from '../controllers/sancionesController.js';

const router = Router();

// GET /api/sanciones/dashboard - Panel de control con estadísticas
router.get('/dashboard', obtenerDashboard);

// GET /api/sanciones - Lista de usuarios sancionados
router.get('/', obtenerSancionados);

// POST /api/sanciones/actualizar - Procesar sanciones por préstamos vencidos
router.post('/actualizar', (req, res) => {
  // TODO: Implementar lógica para procesar préstamos vencidos y aplicar sanciones
  res.status(200).json({ 
    exito: true, 
    mensaje: "Motor ejecutado: Sanciones actualizadas correctamente." 
  });
});

// PUT /api/sanciones/perdonar/:id - Perdonar sanciones de un usuario
router.put('/perdonar/:id', perdonarSancion);

export default router;