/**
 * Controlador de Catálogo
 * Maneja la obtención de equipos disponibles para préstamo
 */
import { config } from '../config/config.js';
import { obtenerTodosEquipos, prestamosDB } from '../database/db.js';

/**
 * Controlador para obtener el catálogo completo de equipos
 * GET /api/catalogo
 * 
 * Retorna la lista de todos los equipos con disponibilidad REAL
 * (calculada restando préstamos PENDIENTE del stock_total)
 * 
 * @param {Object} req - Objeto request de Express
 * @param {Object} res - Objeto response de Express
 */
export const obtenerCatalogo = (req, res) => {
  try {
    // Obtener todos los equipos de la base de datos
    const equipos = obtenerTodosEquipos();
    
    // Validar que existan equipos
    if (!equipos || equipos.length === 0) {
      return res.status(404).json({
        message: 'No hay equipos disponibles en el catálogo.'
      });
    }
    
    // ⭐ CALCULAR DISPONIBILIDAD REAL
    const equiposConDisponibilidad = equipos.map(equipo => {
      // Contar cuántos préstamos PENDIENTE hay de este equipo
      const prestamosActivos = prestamosDB.filter(p => 
        p.id_equipo === equipo.id && p.estado === 'PENDIENTE'
      ).length;
      
      // Calcular disponibles = stock_total - prestamosActivos
      const disponibles = Math.max(0, (equipo.stock_total || 1) - prestamosActivos);
      
      return {
        ...equipo,
        stock_disponible: disponibles,
        stock_prestado: prestamosActivos,
        // Actualizar estado según disponibilidad
        estado: disponibles > 0 ? "Disponible" : "En Mantenimiento"
      };
    });
    
    // Retornar respuesta con los equipos
    return res.status(200).json({
      exito: true,
      cantidad: equiposConDisponibilidad.length,
      equipos: equiposConDisponibilidad
    });
    
  } catch (error) {
    console.error('Error al obtener catálogo:', error);
    return res.status(500).json({
      message: 'Error al obtener el catálogo de equipos',
      error: error.message
    });
  }
};

/**
 * Controlador para obtener un equipo específico por ID
 * GET /api/catalogo/:id
 * 
 * @param {Object} req - Objeto request de Express
 * @param {Object} res - Objeto response de Express
 */
export const obtenerEquipoPorId = (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener todos los equipos
    const equipos = obtenerTodosEquipos();
    
    // Buscar el equipo específico
    const equipo = equipos.find(e => e.id === parseInt(id) || e.id === id);
    
    if (!equipo) {
      return res.status(404).json({
        message: `Equipo con ID ${id} no encontrado.`
      });
    }
    
    // ⭐ CALCULAR DISPONIBILIDAD PARA ESTE EQUIPO
    const prestamosActivos = prestamosDB.filter(p => 
      p.id_equipo === equipo.id && p.estado === 'PENDIENTE'
    ).length;
    
    const disponibles = Math.max(0, (equipo.stock_total || 1) - prestamosActivos);
    
    const equipoConDisponibilidad = {
      ...equipo,
      stock_disponible: disponibles,
      stock_prestado: prestamosActivos,
      estado: disponibles > 0 ? "Disponible" : "En Mantenimiento"
    };
    
    return res.status(200).json({
      exito: true,
      equipo: equipoConDisponibilidad
    });
    
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    return res.status(500).json({
      message: 'Error al obtener el equipo',
      error: error.message
    });
  }
};
