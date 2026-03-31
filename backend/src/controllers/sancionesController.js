/**
 * Controlador de Sanciones
 * Maneja la obtención de usuarios sancionados y el perdón de sanciones
 */

import {
  usuariosDB,
  obtenerUsuarioPorId,
  obtenerEquipoRetenidoPorUsuario,
  obtenerDashboardSanciones,
} from "../database/db.js";

/**
 * GET /api/sanciones
 * Devuelve lista de usuarios con strikes > 0 o estado SUSPENDIDO
 * Incluye información del equipo retenido (si aplica)
 */
export const obtenerSancionados = (req, res) => {
  try {
    // Filtrar usuarios sancionados (strikes > 0 o suspendidos)
    const usuariosSancionados = usuariosDB.filter(
      (usuario) => usuario.strikes > 0 || usuario.estado === "SUSPENDIDO",
    );

    // ⭐ MAPEAR CON INFORMACIÓN DE EQUIPO RETENIDO
    const usuariosConEquipo = usuariosSancionados.map((user) => ({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      strikes: user.strikes,
      estado: user.estado,
      fechaCreacion: user.fechaCreacion,
      equipoRetenido: obtenerEquipoRetenidoPorUsuario(user.id) || "N/A",
    }));

    return res.status(200).json({
      exito: true,
      cantidad: usuariosConEquipo.length,
      datos: usuariosConEquipo,
    });
  } catch (error) {
    console.error("Error en obtenerSancionados:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error al obtener usuarios sancionados",
      error: error.message,
    });
  }
};

/**
 * PUT /api/sanciones/perdonar/:id
 * Resetea strikes y estado de un usuario sancionado
 */
export const perdonarSancion = (req, res) => {
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

    // Validación: usuario debe estar sancionado
    if (usuario.strikes === 0 && usuario.estado !== "SUSPENDIDO") {
      return res.status(400).json({
        exito: false,
        mensaje: "Este usuario no tiene sanciones para perdonar.",
      });
    }

    // Resetear sanciones
    const strikesAnteriores = usuario.strikes;
    usuario.strikes = 0;
    usuario.estado = "ACTIVO";

    return res.status(200).json({
      exito: true,
      mensaje: `Sanciones perdonadas para ${usuario.nombre}. Strikes reseteados de ${strikesAnteriores} a 0.`,
      datos: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        strikes: usuario.strikes,
        estado: usuario.estado,
        strikesAnteriores: strikesAnteriores,
      },
    });
  } catch (error) {
    console.error("Error en perdonarSancion:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error al perdonar la sanción",
      error: error.message,
    });
  }
};

/**
 * GET /api/sanciones/dashboard
 * Retorna un dashboard completo con estadísticas de sanciones
 * Incluye: usuarios_sancionados, suspendidos, total_strikes, y detalles de sancionados
 */
export const obtenerDashboard = (req, res) => {
  try {
    const dashboard = obtenerDashboardSanciones();

    return res.status(200).json({
      exito: true,
      mensaje: "Dashboard de sanciones obtenido exitosamente.",
      datos: dashboard,
    });
  } catch (error) {
    console.error("Error en obtenerDashboard:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error al obtener el dashboard de sanciones",
      error: error.message,
    });
  }
};
