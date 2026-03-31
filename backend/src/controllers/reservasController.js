//import { pool } from '../config/db.js';
import { obtenerTodosEquipos, prestamosDB } from "../database/db.js";

// 1. Crear Reserva (Estudiante)
export const crearReserva = async (req, res) => {
  const { id_equipo } = req.body;
  // Si tienes el id del usuario desde un middleware de auth, usa ese.
  // Si lo mandas desde el front, recíbelo del req.body. Aquí asumo que viene en req.body para simplificar.
  const { id_usuario } = req.body;

  try {
    const equipo = await pool.query(
      "SELECT estado, stock_total FROM equipos WHERE id = $1",
      [id_equipo],
    );

    if (equipo.rows.length === 0) {
      return res.status(404).json({ mensaje: "Equipo no encontrado" });
    }

    // Iniciar transacción
    await pool.query("BEGIN");

    // Cambiar estado del equipo a RESERVADO
    await db.query("UPDATE equipos SET estado = 'RESERVADO' WHERE id = $1", [
      id_equipo,
    ]);

    // Crear la reserva en prestamos
    await pool.query(
      "INSERT INTO prestamos (id_usuario, id_equipo, fecha_prestamo, estado) VALUES ($1, $2, CURRENT_DATE, 'RESERVADO')",
      [id_usuario, id_equipo],
    );

    await pool.query("COMMIT");
    res.status(200).json({ mensaje: "¡Equipo reservado con éxito!" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error al reservar:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// 2. Obtener Reservas Pendientes (Admin)
export const obtenerReservasPendientes = async (req, res) => {
  try {
    const query = `
      SELECT p.id as id_reserva, u.nombre as nombre_estudiante, u.email as correo_estudiante,
             e.id as id_equipo, e.nombre as nombre_equipo, p.fecha_prestamo as fecha_reserva
      FROM prestamos p
      JOIN usuarios u ON p.id_usuario = u.id
      JOIN equipos e ON p.id_equipo = e.id
      WHERE p.estado = 'RESERVADO'
    `;
    const result = await pool.query(query);
    res.status(200).json({ reservas: result.rows });
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// 3. Aprobar Reserva (Admin)
export const aprobarReserva = async (req, res) => {
  const { id_reserva } = req.params;

  try {
    const fechaDevolucion = new Date();
    fechaDevolucion.setDate(fechaDevolucion.getDate() + 15);

    await pool.query(
      `
      UPDATE prestamos 
      SET estado = 'PENDIENTE', 
          fecha_prestamo = CURRENT_DATE, 
          fecha_devolucion = $1 
      WHERE id = $2
    `,
      [fechaDevolucion, id_reserva],
    );

    // El estado del equipo debe cambiar a EN_PRESTAMO
    const reserva = await pool.query(
      "SELECT id_equipo FROM prestamos WHERE id = $1",
      [id_reserva],
    );
    if (reserva.rows.length > 0) {
      await pool.query(
        "UPDATE equipos SET estado = 'EN_PRESTAMO' WHERE id = $1",
        [reserva.rows[0].id_equipo],
      );
    }

    res.status(200).json({ mensaje: "¡Equipo entregado y préstamo activado!" });
  } catch (error) {
    console.error("Error al aprobar reserva:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// 4. Cancelar Reserva (Admin)
export const cancelarReserva = async (req, res) => {
  const { id_reserva } = req.params;

  try {
    await pool.query("BEGIN");

    const reserva = await pool.query(
      "SELECT id_equipo FROM prestamos WHERE id = $1",
      [id_reserva],
    );
    if (reserva.rows.length === 0) throw new Error("Reserva no encontrada");

    const id_equipo = reserva.rows[0].id_equipo;

    await pool.query(
      "UPDATE prestamos SET estado = 'CANCELADO' WHERE id = $1",
      [id_reserva],
    );
    await pool.query("UPDATE equipos SET estado = 'DISPONIBLE' WHERE id = $1", [
      id_equipo,
    ]);

    await pool.query("COMMIT");
    res.status(200).json({ mensaje: "Reserva cancelada, equipo liberado." });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error al cancelar reserva:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};
