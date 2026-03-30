import { Router } from 'express';

const router = Router();

// PUT /api/usuarios/:id/strike - Botón naranja de React para clavar strike manual
router.put('/:id/strike', (req, res) => {
  const { id } = req.params;
  // Aquí lógicamente le sumarías 1 al strike del usuario en tu array
  res.status(200).json({ 
    exito: true, 
    mensaje: `Strike manual asignado exitosamente al usuario ${id}.` 
  });
});

export default router;