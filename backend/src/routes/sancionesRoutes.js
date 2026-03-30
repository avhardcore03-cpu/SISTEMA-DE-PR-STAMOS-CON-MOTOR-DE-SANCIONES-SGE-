import { Router } from 'express';

const router = Router();

// GET /api/sanciones/dashboard - Alimenta los contadores de arriba
router.get('/dashboard', (req, res) => {
  // Aquí devolvemos datos simulados para que tu React se vea 'Pro'
  res.status(200).json({
    enLaMira: 3,      // Usuarios con 1 o 2 strikes
    suspendidos: 1,   // Usuarios con 3 strikes
    totalStrikes: 5   // Suma de todos los strikes activos
  });
});

// GET /api/sanciones - Llena la tabla de usuarios sancionados
router.get('/', (req, res) => {
  res.status(200).json([
    { id: 1, nombre: 'Juan Pérez', equipoRetenido: 'Portátil Lenovo ThinkPad', strikes: 2 },
    { id: 2, nombre: 'María Gómez', equipoRetenido: 'Cámara Canon EOS', strikes: 3 }
  ]);
});

// POST /api/sanciones/actualizar - El botón morado nuclear
router.post('/actualizar', (req, res) => {
  res.status(200).json({ 
    exito: true, 
    mensaje: "Motor ejecutado: Sanciones actualizadas correctamente." 
  });
});

// PUT /api/sanciones/perdonar/:id - El botón verde para limpiar pecados
router.put('/perdonar/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({ 
    exito: true, 
    mensaje: `Sanciones perdonadas y cuenta en 0 para el usuario ${id}.` 
  });
});

export default router;