/**
 * Controlador de Préstamos
 * Maneja la lógica de devolución de equipos, CRUD y el MOTOR DE SANCIONES
 * Este es el corazón del negocio: detectar retrasos, aplicar strikes y manejar inventario.
 */

import { config } from "../config/config.js";
import {
  crearSolicitudPrestamo,
  obtenerPrestamoPorId,
  obtenerUsuarioPorId,
  actualizarEstadoPorStrikes,
  prestamosDB,
  usuariosDB,
  equiposDB,
  obtenerTodosPrestamos,
  calcularFechaConDiasHabiles,
  obtenerPrestamosVencidos,
  asignarStrike,
} from "../database/db.js";

/**
 * Función auxiliar para calcular el número de días de retraso
 * * @param {Date} fechaEsperada - Fecha en la que debería haberse devuelto
 * @param {Date} fechaReal - Fecha en la que se devolvió realmente
 * @returns {number} Número de días de retraso (0 si no hay retraso)
 */
const calcularDiasRetraso = (fechaEsperada, fechaReal) => {
  const fecha1 = new Date(fechaEsperada);
  const fecha2 = new Date(fechaReal);

  const tiempoEnMilisegundos = fecha2 - fecha1;
  const diasRetraso = Math.ceil(tiempoEnMilisegundos / (1000 * 60 * 60 * 24));

  return diasRetraso > 0 ? diasRetraso : 0;
};

/**
 * Controlador principal: Devolver un equipo
 * POST /api/prestamos/devolver ó PUT /api/prestamos/:id/devolver
 */
export const devolverEquipo = async (req, res) => {
  try {
    // Soportamos el ID tanto por body (tu original) como por params (desde el frontend embebido)
    const id_prestamo = req.body.id_prestamo || req.params.id;
    const fecha_entrega_real = req.body.fecha_entrega_real || new Date();

    if (!id_prestamo) {
      return res.status(400).json({
        exito: false,
        mensaje: "id_prestamo es requerido.",
        codigo: "DATOS_INCOMPLETOS",
      });
    }

    const prestamo = obtenerPrestamoPorId(parseInt(id_prestamo));

    if (!prestamo) {
      return res.status(404).json({
        exito: false,
        mensaje: `El préstamo con ID ${id_prestamo} no existe.`,
        codigo: "PRESTAMO_NO_ENCONTRADO",
      });
    }

    if (prestamo.estado === "DEVUELTO") {
      return res.status(400).json({
        exito: false,
        mensaje: "Este préstamo ya ha sido devuelto previamente.",
        codigo: "PRESTAMO_YA_DEVUELTO",
      });
    }

    const usuario = obtenerUsuarioPorId(prestamo.id_usuario);

    if (!usuario) {
      return res.status(404).json({
        exito: false,
        mensaje: "El usuario asociado al préstamo no existe.",
        codigo: "USUARIO_NO_ENCONTRADO",
      });
    }

    // ===== LÓGICA DEL MOTOR DE SANCIONES =====
    const diasRetraso = calcularDiasRetraso(
      prestamo.fecha_esperada || prestamo.fecha_devolucion,
      fecha_entrega_real,
    );

    let huboRetraso = false;
    let strikesAntesDelRetraso = usuario.strikes;

    if (diasRetraso > 0) {
      huboRetraso = true;
      usuario.strikes += 1;

      console.log(
        `⚠️  SANCIÓN APLICADA: Usuario ${usuario.nombre} - ${diasRetraso} días de retraso`,
      );
      console.log(
        `   Strikes antes: ${strikesAntesDelRetraso} | Strikes después: ${usuario.strikes}`,
      );
    }

    if (usuario.strikes >= config.TACKLES_PARA_SUSPENDER) {
      actualizarEstadoPorStrikes(usuario);
      console.log(
        `🚫 USUARIO SUSPENDIDO: ${usuario.nombre} ha alcanzado ${usuario.strikes} strikes`,
      );
    }

    // ===== ACTUALIZAR ESTADO DEL PRÉSTAMO =====
    prestamo.estado = "DEVUELTO";
    prestamo.fecha_entrega_real = new Date(fecha_entrega_real);

    // ⭐ ACTUALIZAR STOCK MATEMÁTICAMENTE ⭐
    const equipo = equiposDB.find((e) => e.id === prestamo.id_equipo);
    if (equipo) {
      equipo.stock_total += 1; // Sumamos 1 de vuelta al inventario
    }

    let mensaje = "Equipo devuelto exitosamente. Stock restaurado.";
    let codigoRespuesta = 200;

    if (huboRetraso) {
      mensaje = `Equipo devuelto con ${diasRetraso} día(s) de retraso. Se ha registrado una sanción. Stock restaurado.`;
    }

    if (usuario.estado === "SUSPENDIDO") {
      mensaje += ` ⚠️ ALERTA: Tu cuenta ha sido suspendida por exceso de retrasos (${usuario.strikes} strikes).`;
    }

    return res.status(codigoRespuesta).json({
      exito: true,
      mensaje,
      datos: {
        prestamo: {
          ...prestamo,
          diasRetraso,
        },
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          estado: usuario.estado,
          strikes: usuario.strikes,
          huboRetraso,
        },
      },
    });
  } catch (error) {
    console.error("Error en devolverEquipo:", error);
    return res.status(500).json({
      exito: false,
      mensaje: "Error al procesar la devolución del equipo",
      error: error.message,
    });
  }
};

/**
 * Controlador para obtener todos los préstamos de un usuario
 * GET /api/prestamos/usuario/:id_usuario
 */
export const obtenerPrestamosDelUsuario = (req, res) => {
  try {
    const { id_usuario } = req.params;

    if (isNaN(id_usuario)) {
      return res
        .status(400)
        .json({ exito: false, mensaje: "El ID debe ser un número." });
    }

    const usuario = obtenerUsuarioPorId(parseInt(id_usuario));
    if (!usuario) {
      return res
        .status(404)
        .json({ exito: false, mensaje: "Usuario no existe." });
    }

    const prestamosDeLusuario = prestamosDB.filter(
      (p) => p.id_usuario === parseInt(id_usuario),
    );

    return res.status(200).json({
      exito: true,
      datos: { prestamos: prestamosDeLusuario },
    });
  } catch (error) {
    return res.status(500).json({ exito: false, error: error.message });
  }
};

/**
 * Controlador para obtener todos los préstamos pendientes
 * GET /api/prestamos/pendientes
 */
export const obtenerPrestamossPendientes = (req, res) => {
  try {
    const prestamosPendientes = prestamosDB.filter(
      (p) => p.estado === "PENDIENTE",
    );
    return res.status(200).json({
      exito: true,
      datos: {
        cantidad: prestamosPendientes.length,
        prestamos: prestamosPendientes,
      },
    });
  } catch (error) {
    return res.status(500).json({ exito: false, error: error.message });
  }
};

/**
 * Controlador para obtener el detalle de un préstamo específico
 * GET /api/prestamos/:id_prestamo
 */
export const obtenerDetallePrestamo = (req, res) => {
  try {
    const { id_prestamo } = req.params;
    const prestamo = obtenerPrestamoPorId(parseInt(id_prestamo));

    if (!prestamo)
      return res
        .status(404)
        .json({ exito: false, mensaje: "Préstamo no existe." });

    const usuario = obtenerUsuarioPorId(prestamo.id_usuario);
    return res.status(200).json({ exito: true, datos: { prestamo, usuario } });
  } catch (error) {
    return res.status(500).json({ exito: false, error: error.message });
  }
};

/**
 * POST /api/prestamos/solicitar
 */
export const solicitarEquipo = (req, res) => {
  try {
    const { id_usuario, id_equipo } = req.body;

    if (!id_usuario || !id_equipo)
      return res.status(400).json({ exito: false, mensaje: "Faltan datos." });

    const usuario = obtenerUsuarioPorId(id_usuario);
    if (!usuario)
      return res
        .status(404)
        .json({ exito: false, mensaje: "Usuario no existe." });

    if (usuario.estado === "SUSPENDIDO")
      return res
        .status(403)
        .json({ exito: false, mensaje: "Usuario suspendido." });

    const nuevoPrestamo = crearSolicitudPrestamo(id_usuario, id_equipo);

    return res.status(201).json({ exito: true, datos: nuevoPrestamo });
  } catch (error) {
    return res.status(500).json({ exito: false, error: error.message });
  }
};

/**
 * GET /api/prestamos
 * Obtiene todos los préstamos para la vista de la tabla
 */
export const obtenerTodosPrestamosController = (req, res) => {
  try {
    // Mantenemos la lógica de devolver un array directo si el frontend lo espera así,
    // pero también incluimos tu formato de respuesta original por seguridad.
    const todosLosPrestamos = obtenerTodosPrestamos();
    // const prestamosVencidos = obtenerPrestamosVencidos();

    return res.status(200).json({ prestamos: todosLosPrestamos }); // Ajustado para que encaje con dataPrestamos.prestamos en React
  } catch (error) {
    return res.status(500).json({ exito: false, error: error.message });
  }
};

/**
 * POST /api/prestamos/crear (o POST /api/prestamos)
 * Crea un nuevo préstamo. RESTA STOCK AUTOMÁTICAMENTE.
 */
export const crearPrestamo = async (req, res) => {
  try {
    const { id_usuario, id_equipo, fecha_prestamo } = req.body;

    if (!id_usuario || !id_equipo || !fecha_prestamo) {
      return res.status(400).json({
        exito: false,
        mensaje: "❌ Faltan datos: usuario, equipo o fecha.",
      });
    }

    const usuario = obtenerUsuarioPorId(parseInt(id_usuario));
    if (!usuario)
      return res
        .status(404)
        .json({ exito: false, mensaje: "Usuario no encontrado." });

    const equipo = equiposDB.find((e) => e.id === parseInt(id_equipo));
    if (!equipo)
      return res
        .status(404)
        .json({ exito: false, mensaje: "Equipo no encontrado." });

    // Calcular fechas
    const fechaPrestamoObj = new Date(fecha_prestamo);
    const fechaDevolucionObj = calcularFechaConDiasHabiles(
      fechaPrestamoObj,
      15,
    );

    if (fechaPrestamoObj > fechaDevolucionObj)
      return res.status(400).json({ exito: false, mensaje: "Fecha inválida." });

    // VALIDAR STOCK
    const prestamosActivosDelEquipo = prestamosDB.filter(
      (p) => p.id_equipo === parseInt(id_equipo) && p.estado === "PENDIENTE",
    ).length;
    const stockDisponible = equipo.stock_total - prestamosActivosDelEquipo;

    if (stockDisponible <= 0 || equipo.stock_total <= 0) {
      return res
        .status(400)
        .json({ exito: false, mensaje: `El equipo no tiene disponibilidad.` });
    }

    // ⭐ ACTUALIZAR STOCK MATEMÁTICAMENTE ⭐
    equipo.stock_total -= 1;

    // CREAR NUEVO PRÉSTAMO
    const maxId =
      prestamosDB.length > 0
        ? Math.max(...prestamosDB.map((p) => p.id_prestamo || p.id))
        : 100;

    const nuevoPrestamo = {
      id: maxId + 1,
      id_prestamo: maxId + 1,
      id_usuario: parseInt(id_usuario),
      nombre_usuario: usuario.nombre,
      email_usuario: usuario.email,
      tipo_documento: usuario.tipo_documento,
      identificacion: usuario.identificacion,
      id_equipo: parseInt(id_equipo),
      nombre_equipo: equipo.nombre,
      fecha_prestamo: fechaPrestamoObj,
      fecha_esperada: fechaDevolucionObj,
      fecha_devolucion: fechaDevolucionObj,
      fecha_entrega_real: null,
      estado: "PENDIENTE",
      fecha_sancion: null,
      dias_retraso: 0,
    };

    prestamosDB.push(nuevoPrestamo);

    // Responder exactamente con la estructura que el frontend espera para mostrar el mensaje
    return res.status(201).json({
      exito: true,
      mensaje: "Préstamo creado.",
      datos: {
        ...nuevoPrestamo,
        fecha_devolucion: fechaDevolucionObj.toISOString(), // Formateado para que React lo lea
      },
    });
  } catch (error) {
    return res.status(500).json({ exito: false, error: error.message });
  }
};

/**
 * PUT /api/prestamos/:id/strike
 */
export const asignarStrikePrestamo = (req, res) => {
  try {
    const { id } = req.params;
    const prestamo = obtenerPrestamoPorId(parseInt(id));

    if (!prestamo)
      return res
        .status(404)
        .json({ exito: false, mensaje: `Préstamo no encontrado.` });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaDevolucion = new Date(prestamo.fecha_devolucion);
    fechaDevolucion.setHours(0, 0, 0, 0);

    if (hoy <= fechaDevolucion)
      return res
        .status(400)
        .json({ exito: false, mensaje: "Préstamo no vencido." });
    if (prestamo.estado !== "PENDIENTE")
      return res
        .status(400)
        .json({ exito: false, mensaje: "Debe estar PENDIENTE." });

    const usuario = obtenerUsuarioPorId(prestamo.id_usuario);
    asignarStrike(prestamo.id_usuario);
    prestamo.fecha_sancion = new Date();

    return res
      .status(200)
      .json({ exito: true, mensaje: `Strike asignado a ${usuario.nombre}.` });
  } catch (error) {
    return res.status(500).json({ exito: false, error: error.message });
  }
};

/**
 * DELETE /api/prestamos/:id
 * NUEVA FUNCIÓN: Elimina un préstamo y restaura el stock si no había sido devuelto
 */
export const eliminarPrestamo = (req, res) => {
  try {
    const { id } = req.params;
    const index = prestamosDB.findIndex(
      (p) => p.id_prestamo === parseInt(id) || p.id === parseInt(id),
    );

    if (index === -1) {
      return res
        .status(404)
        .json({ exito: false, mensaje: "Préstamo no encontrado" });
    }

    const prestamo = prestamosDB[index];

    // ⭐ RESTAURAR STOCK MATEMÁTICAMENTE SI ESTABA PENDIENTE ⭐
    if (prestamo.estado === "PENDIENTE") {
      const equipo = equiposDB.find((e) => e.id === prestamo.id_equipo);
      if (equipo) {
        equipo.stock_total += 1;
      }
    }

    // Eliminar del array
    prestamosDB.splice(index, 1);

    return res
      .status(200)
      .json({
        exito: true,
        mensaje: "Préstamo eliminado y stock restaurado si aplicaba.",
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        exito: false,
        mensaje: "Error interno al eliminar",
        error: error.message,
      });
  }
};

// --- EN TU BACKEND (ej. reservasController.js o prestamosController.js) ---

// 1. Obtener todas las reservas pendientes (Para que el admin las vea)
const obtenerReservasPendientes = async (req, res) => {
  try {
    // Traemos los préstamos que estén en estado 'RESERVADO'
    const query = `
      SELECT p.id as id_reserva, u.nombre as nombre_estudiante, u.email as correo_estudiante,
             e.id as id_equipo, e.nombre as nombre_equipo, p.fecha_prestamo as fecha_reserva
      FROM prestamos p
      JOIN usuarios u ON p.id_usuario = u.id
      JOIN equipos e ON p.id_equipo = e.id
      WHERE p.estado = 'RESERVADO'
    `;
    const result = await db.query(query);
    res.status(200).json({ reservas: result.rows });
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// 2. Aprobar la reserva (Entregar el equipo físicamente)
const aprobarReserva = async (req, res) => {
  const { id_reserva } = req.params;

  try {
    // Calculamos la fecha de devolución (ej. 15 días desde hoy)
    const fechaDevolucion = new Date();
    fechaDevolucion.setDate(fechaDevolucion.getDate() + 15);

    // Cambiamos el estado a 'PENDIENTE' (o 'EN_PRESTAMO') y asignamos las fechas reales
    await db.query(
      `
      UPDATE prestamos 
      SET estado = 'PENDIENTE', 
          fecha_prestamo = CURRENT_DATE, 
          fecha_devolucion = $1 
      WHERE id = $2
    `,
      [fechaDevolucion, id_reserva],
    );

    res.status(200).json({ mensaje: "¡Equipo entregado y préstamo activado!" });
  } catch (error) {
    console.error("Error al aprobar reserva:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// 3. Rechazar o Cancelar reserva (El estudiante nunca apareció)
const cancelarReserva = async (req, res) => {
  const { id_reserva } = req.params;

  try {
    await db.query("BEGIN");

    // Obtener el equipo asociado a esta reserva
    const reserva = await db.query(
      "SELECT id_equipo FROM prestamos WHERE id = $1",
      [id_reserva],
    );
    if (reserva.rows.length === 0) throw new Error("Reserva no encontrada");

    const id_equipo = reserva.rows[0].id_equipo;

    // Eliminar la reserva (o cambiarla a estado 'CANCELADO')
    await db.query("UPDATE prestamos SET estado = 'CANCELADO' WHERE id = $1", [
      id_reserva,
    ]);

    // Devolver el equipo a estado 'DISPONIBLE' (o sumar 1 al stock)
    await db.query("UPDATE equipos SET estado = 'DISPONIBLE' WHERE id = $1", [
      id_equipo,
    ]);

    await db.query("COMMIT");
    res.status(200).json({ mensaje: "Reserva cancelada, equipo liberado." });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error al cancelar reserva:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};
