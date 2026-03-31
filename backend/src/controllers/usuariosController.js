/**
 * Controlador de Usuarios
 * Maneja operaciones relacionadas con usuarios (strikes, etc.)
 */

import { obtenerUsuarioPorId } from "../database/db.js";

/**
 * Calcula el estado del usuario basado en sus strikes
 * 0 strikes = ACTIVO
 * 1 strike = OBSERVACIÓN
 * 2 strikes = ADVERTENCIA
 * 3+ strikes = SUSPENDIDO
 */
const calcularEstadoPorStrikes = (strikes) => {
  if (strikes === 0) return "ACTIVO";
  if (strikes === 1) return "OBSERVACIÓN";
  if (strikes === 2) return "ADVERTENCIA";
  return "SUSPENDIDO";
};

/**
 * PUT /api/usuarios/:id/strike
 * Asigna un strike manual a un usuario
 */
export const asignarStrike = (req, res) => {
  try {
    const { id } = req.params;

    // Validación: ID requerido
    if (!id) {
      return res.status(400).json({
        exito: false,
        mensaje: "ID de usuario requerido.",
      });
    }

    // Buscar usuario
    const usuario = obtenerUsuarioPorId(parseInt(id));
    if (!usuario) {
      return res.status(404).json({
        exito: false,
        mensaje: `Usuario con ID ${id} no encontrado.`,
      });
    }

    // Incrementar strikes
    usuario.strikes += 1;

    // Actualizar estado basado en strikes
    usuario.estado = calcularEstadoPorStrikes(usuario.strikes);

    return res.status(200).json({
      exito: true,
      mensaje: `Strike asignado exitosamente a ${usuario.nombre}. Strikes totales: ${usuario.strikes}. Estado: ${usuario.estado}`,
      datos: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        strikes: usuario.strikes,
        estado: usuario.estado,
      },
    });
  } catch (error) {
    console.error("Error en asignarStrike:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error al asignar strike",
      error: error.message,
    });
  }
};
