/**
 * Configuración Principal de la Aplicación Express - INTEGRACIÓN TOTAL CON SANCIONES
 * FIX: CRUD DE INVENTARIO (PUT) Y LÓGICA DE STRIKES
 */

import express from "express";
import cors from "cors";
import {
  usuariosDB as usuariosSeed,
  equiposDB as equiposSeed,
  prestamosDB as prestamosSeed,
} from "./database/db.js";

const app = express();

// ===== DATOS EN MEMORIA INICIALIZADOS DESDE db.js =====
const toISODate = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  return d.toISOString().split("T")[0];
};

let miInventario = equiposSeed.map((equipo) => ({
  id: equipo.id,
  nombre: equipo.nombre,
  categoria: equipo.categoria,
  cantidad: Number(equipo.stock_total ?? 0),
  estado: equipo.estado || "Disponible",
}));

let usuariosDB = usuariosSeed.map((u) => ({
  id: u.id,
  username: u.nombre,
  email: u.email,
  // Contraseñas de prueba para entorno local.
  password: u.rol === "ADMIN" ? "admin" : "password123",
  rol: u.rol,
  strikes: Number(u.strikes || 0),
  estado: u.estado || "ACTIVO",
}));

let misPrestamos = prestamosSeed.map((p) => ({
  id: p.id_prestamo,
  id_usuario: p.id_usuario,
  productoId: p.id_equipo,
  productoNombre: p.nombre_equipo,
  usuario: p.nombre_usuario,
  cantidad: 1,
  fecha_salida: toISODate(p.fecha_prestamo),
  fecha_pactada: toISODate(p.fecha_devolucion),
  estado: p.estado === "PENDIENTE" ? "Pendiente" : "Devuelto",
  sancionAplicada: false,
}));

const hoyMasDias = (dias) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().split("T")[0];
};

const calcularEstadoPorStrikes = (strikes) => {
  if (strikes >= 3) return "SUSPENDIDO";
  if (strikes === 2) return "ADVERTENCIA";
  if (strikes === 1) return "OBSERVACIÓN";
  return "ACTIVO";
};

const buscarUsuarioPrestamo = ({ id_usuario, usuario }) => {
  if (id_usuario) {
    return usuariosDB.find((u) => u.id === Number(id_usuario));
  }

  if (usuario) {
    const clave = String(usuario).trim().toLowerCase();
    return usuariosDB.find(
      (u) =>
        u.username.toLowerCase() === clave || u.email.toLowerCase() === clave,
    );
  }

  return null;
};

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(`\n📡 Solicitud: ${req.method} ${req.path}`);
  next();
});

// ===== 🔑 LOGIN HÍBRIDO =====
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email y contraseña son requeridos." });
  }

  const user = usuariosDB.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase(),
  );

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Credenciales inválidas." });
  }

  if (user.estado === "SUSPENDIDO" || user.strikes >= 3) {
    return res.status(403).json({
      exito: false,
      message: "Usuario suspendido. No puede iniciar sesión.",
    });
  }

  return res.status(200).json({
    exito: true,
    message: "Inicio de sesión exitoso.",
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.rol,
      estado: user.estado,
      strikes: user.strikes,
    },
    token: "token-de-emergencia-12345",
  });
});

app.get("/api/usuarios/:id", (req, res) => {
  const { id } = req.params;
  const usuario = usuariosDB.find((u) => u.id === Number(id));

  if (!usuario) {
    return res.status(404).json({
      exito: false,
      mensaje: `Usuario con ID ${id} no encontrado.`,
    });
  }

  return res.status(200).json({
    exito: true,
    id: usuario.id,
    nombre: usuario.username,
    email: usuario.email,
    rol: usuario.rol,
    estado: usuario.estado,
    strikes: usuario.strikes,
  });
});

app.get("/api/usuarios", (req, res) => {
  const usuarios = usuariosDB.map((u) => ({
    id: u.id,
    nombre: u.username,
    email: u.email,
    rol: u.rol,
    estado: u.estado,
    strikes: u.strikes,
  }));

  return res.status(200).json({
    exito: true,
    datos: usuarios,
  });
});

app.post("/api/usuarios", (req, res) => {
  const { nombre, email, rol } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({
      exito: false,
      mensaje: "Nombre y email son obligatorios.",
    });
  }

  const emailNormalizado = String(email).trim().toLowerCase();
  const existe = usuariosDB.some(
    (u) => u.email.toLowerCase() === emailNormalizado,
  );
  if (existe) {
    return res.status(409).json({
      exito: false,
      mensaje: "Ya existe un usuario con ese email.",
    });
  }

  const nuevoId = usuariosDB.length
    ? Math.max(...usuariosDB.map((u) => u.id)) + 1
    : 1;

  const nuevoUsuario = {
    id: nuevoId,
    username: String(nombre).trim(),
    email: emailNormalizado,
    password: "password123",
    rol: rol === "ADMIN" ? "ADMIN" : "ESTUDIANTE",
    strikes: 0,
    estado: "ACTIVO",
  };

  usuariosDB.push(nuevoUsuario);

  return res.status(201).json({
    exito: true,
    mensaje: "Usuario creado correctamente.",
    datos: {
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.username,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol,
      estado: nuevoUsuario.estado,
      strikes: nuevoUsuario.strikes,
    },
  });
});

app.delete("/api/usuarios/:id", (req, res) => {
  const { id } = req.params;
  const idNumero = Number(id);
  const indice = usuariosDB.findIndex((u) => u.id === idNumero);

  if (indice === -1) {
    return res
      .status(404)
      .json({ exito: false, mensaje: "Usuario no encontrado." });
  }

  const usuario = usuariosDB[indice];
  if (usuario.rol === "ADMIN") {
    return res.status(400).json({
      exito: false,
      mensaje: "No se puede eliminar un usuario administrador.",
    });
  }

  const tienePrestamoPendiente = misPrestamos.some(
    (p) => p.id_usuario === idNumero && p.estado === "Pendiente",
  );

  if (tienePrestamoPendiente) {
    return res.status(400).json({
      exito: false,
      mensaje: "No se puede eliminar: el usuario tiene prestamos pendientes.",
    });
  }

  usuariosDB.splice(indice, 1);
  return res
    .status(200)
    .json({ exito: true, mensaje: "Usuario eliminado correctamente." });
});

// ===== 📦 RUTAS DE INVENTARIO (CRUD COMPLETO) =====

app.get("/api/inventario", (req, res) => res.json(miInventario));

// 1. CREAR (POST)
app.post("/api/inventario", (req, res) => {
  const { nombre, categoria, cantidad } = req.body;
  const nuevoEquipo = {
    id: Date.now(),
    nombre,
    categoria: categoria || "General",
    cantidad: Number(cantidad),
    estado: "Disponible",
  };
  miInventario.push(nuevoEquipo);
  res.status(201).json(nuevoEquipo);
});

// 2. ACTUALIZAR (PUT) - ¡ESTO ERA LO QUE TE FALTABA!
app.put("/api/inventario/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, cantidad } = req.body;

  const indice = miInventario.findIndex((item) => item.id === Number(id));

  if (indice !== -1) {
    miInventario[indice] = {
      ...miInventario[indice],
      nombre: nombre || miInventario[indice].nombre,
      categoria: categoria || miInventario[indice].categoria,
      cantidad: Number(cantidad),
    };
    console.log(`✅ Equipo ID ${id} actualizado correctamente`);
    res.json(miInventario[indice]);
  } else {
    res.status(404).json({ mensaje: "Equipo no encontrado" });
  }
});

// 3. ELIMINAR (DELETE)
app.delete("/api/inventario/:id", (req, res) => {
  const { id } = req.params;
  miInventario = miInventario.filter((item) => item.id !== Number(id));
  res.json({ exito: true });
});

// ===== 🤝 RUTAS DE PRÉSTAMOS CON BLOQUEO Y FECHAS =====

app.post("/api/prestamos/solicitar", (req, res) => {
  const { id_usuario, id_equipo } = req.body;

  if (!id_usuario || !id_equipo) {
    return res.status(400).json({
      exito: false,
      mensaje: "id_usuario e id_equipo son requeridos.",
    });
  }

  const usuario = usuariosDB.find((u) => u.id === Number(id_usuario));
  if (!usuario) {
    return res
      .status(404)
      .json({ exito: false, mensaje: "Usuario no encontrado." });
  }

  if (usuario.estado === "SUSPENDIDO" || usuario.strikes >= 3) {
    return res.status(403).json({
      exito: false,
      mensaje: "Usuario suspendido. No puede solicitar equipos.",
    });
  }

  const equipo = miInventario.find((e) => e.id === Number(id_equipo));
  if (!equipo) {
    return res
      .status(404)
      .json({ exito: false, mensaje: "Equipo no encontrado." });
  }

  if (Number(equipo.cantidad) <= 0) {
    return res
      .status(400)
      .json({ exito: false, mensaje: "Equipo sin disponibilidad." });
  }

  equipo.cantidad -= 1;
  const nuevoPrestamo = {
    id: Date.now(),
    id_usuario: usuario.id,
    productoId: equipo.id,
    productoNombre: equipo.nombre,
    usuario: usuario.username,
    cantidad: 1,
    fecha_salida: new Date().toISOString().split("T")[0],
    fecha_pactada: hoyMasDias(7),
    estado: "Pendiente",
  };

  misPrestamos.push(nuevoPrestamo);
  return res.status(201).json({
    exito: true,
    mensaje: `Solicitud de "${equipo.nombre}" creada exitosamente.`,
    datos: nuevoPrestamo,
  });
});

app.get("/api/prestamos", (req, res) => res.json(misPrestamos));

app.post("/api/prestamos", (req, res) => {
  const { productoId, id_usuario, usuario, fecha_pactada } = req.body;
  const usuarioPrestamo = buscarUsuarioPrestamo({ id_usuario, usuario });

  if (!usuarioPrestamo) {
    return res.status(404).json({
      mensaje: "Usuario no encontrado para registrar el préstamo.",
    });
  }

  if (usuarioPrestamo.estado === "SUSPENDIDO" || usuarioPrestamo.strikes >= 3) {
    return res.status(403).json({
      mensaje: "⛔ BLOQUEO: El usuario está SUSPENDIDO por exceso de strikes.",
    });
  }

  const producto = miInventario.find((p) => p.id === Number(productoId));
  const cantidad = 1;
  const fechaPactada = fecha_pactada || hoyMasDias(7);

  if (producto && producto.cantidad >= cantidad) {
    producto.cantidad -= cantidad;
    const nuevoPrestamo = {
      id: Date.now(),
      id_usuario: usuarioPrestamo.id,
      productoId: Number(productoId),
      productoNombre: producto.nombre,
      usuario: usuarioPrestamo.username,
      cantidad,
      fecha_salida: new Date().toISOString().split("T")[0],
      fecha_pactada: fechaPactada,
      estado: "Pendiente",
      sancionAplicada: false,
    };
    misPrestamos.push(nuevoPrestamo);
    res.status(201).json(nuevoPrestamo);
  } else {
    res.status(400).json({ mensaje: "Stock insuficiente" });
  }
});

// DEVOLVER CON CÁLCULO DE STRIKES
app.post("/api/prestamos/devolver/:id", (req, res) => {
  const { id } = req.params;
  const { fecha_real_entrega } = req.body;

  const prestamoIndex = misPrestamos.findIndex((p) => p.id === Number(id));

  if (prestamoIndex !== -1) {
    const prestamo = misPrestamos[prestamoIndex];

    // Normalizamos fechas para comparar solo año-mes-día
    const fechaEsperada = new Date(prestamo.fecha_pactada + "T00:00:00");
    const fechaReal = new Date(fecha_real_entrega + "T00:00:00");

    let mensaje = "Devolución a tiempo.";

    if (fechaReal > fechaEsperada) {
      // Buscar al usuario específico del préstamo
      const usuarioSancionado = usuariosDB.find(
        (u) => u.id === prestamo.id_usuario,
      );

      if (usuarioSancionado) {
        usuarioSancionado.strikes += 1;
        usuarioSancionado.estado = calcularEstadoPorStrikes(
          usuarioSancionado.strikes,
        );
        mensaje = `⚠️ RETRASO: Strike #${usuarioSancionado.strikes} aplicado a ${usuarioSancionado.username}.`;

        if (usuarioSancionado.strikes >= 3) {
          mensaje += " Usuario SUSPENDIDO automáticamente.";
        }
      }
    }

    const producto = miInventario.find(
      (p) => p.id === Number(prestamo.productoId),
    );
    if (producto) producto.cantidad += prestamo.cantidad;

    misPrestamos.splice(prestamoIndex, 1);

    res.json({ exito: true, mensaje });
  } else {
    res.status(404).json({ mensaje: "Préstamo no encontrado" });
  }
});

// ===== ⚠️ RUTAS DE SANCIONES EN RAM (alineadas con /api/prestamos) =====

app.get("/api/sanciones", (req, res) => {
  const sancionados = usuariosDB
    .filter((u) => u.strikes > 0 || u.estado === "SUSPENDIDO")
    .map((u) => {
      const prestamoPendiente = misPrestamos.find(
        (p) => p.estado === "Pendiente" && p.id_usuario === u.id,
      );
      return {
        id: u.id,
        nombre: u.username,
        email: u.email,
        rol: u.rol,
        strikes: u.strikes,
        estado: u.estado,
        fechaCreacion: new Date(),
        equipoRetenido: prestamoPendiente?.productoNombre || "N/A",
      };
    });

  return res.status(200).json({
    exito: true,
    cantidad: sancionados.length,
    datos: sancionados,
  });
});

app.get("/api/sanciones/dashboard", (req, res) => {
  const usuariosSancionados = usuariosDB.filter((u) => u.strikes > 0).length;
  const suspendidos = usuariosDB.filter(
    (u) => u.estado === "SUSPENDIDO",
  ).length;
  const totalStrikes = usuariosDB.reduce((acc, u) => acc + u.strikes, 0);

  return res.status(200).json({
    exito: true,
    mensaje: "Dashboard de sanciones en RAM.",
    datos: {
      usuarios_sancionados: usuariosSancionados,
      suspendidos,
      total_strikes: totalStrikes,
    },
  });
});

app.post("/api/sanciones/actualizar", (req, res) => {
  const hoy = new Date();
  let sancionesAplicadas = 0;

  misPrestamos.forEach((prestamo) => {
    const vencido =
      prestamo.estado === "Pendiente" &&
      new Date(`${prestamo.fecha_pactada}T00:00:00`) < hoy;

    if (vencido && !prestamo.sancionAplicada) {
      const usuario = usuariosDB.find((u) => u.id === prestamo.id_usuario);
      if (usuario) {
        usuario.strikes += 1;
        usuario.estado = calcularEstadoPorStrikes(usuario.strikes);
        prestamo.sancionAplicada = true;
        sancionesAplicadas += 1;
      }
    }
  });

  usuariosDB = usuariosDB.map((u) => ({
    ...u,
    estado: calcularEstadoPorStrikes(u.strikes),
  }));

  return res.status(200).json({
    exito: true,
    mensaje: `Estados de sanciones actualizados en RAM. Nuevas sanciones: ${sancionesAplicadas}`,
  });
});

app.put("/api/sanciones/perdonar/:id", (req, res) => {
  const { id } = req.params;
  const usuario = usuariosDB.find((u) => u.id === Number(id));

  if (!usuario) {
    return res.status(404).json({
      exito: false,
      mensaje: `Usuario con ID ${id} no encontrado.`,
    });
  }

  if (usuario.strikes === 0 && usuario.estado !== "SUSPENDIDO") {
    return res.status(400).json({
      exito: false,
      mensaje: "Este usuario no tiene sanciones para perdonar.",
    });
  }

  const strikesAnteriores = usuario.strikes;
  usuario.strikes = 0;
  usuario.estado = "ACTIVO";

  return res.status(200).json({
    exito: true,
    mensaje: `Sanciones perdonadas para ${usuario.username}. Strikes reseteados de ${strikesAnteriores} a 0.`,
    datos: {
      id: usuario.id,
      nombre: usuario.username,
      strikes: usuario.strikes,
      estado: usuario.estado,
      strikesAnteriores,
    },
  });
});

app.get("/", (req, res) =>
  res.status(200).send("✅ Servidor SGE: ONLINE CON SISTEMA DE STRIKES Y CRUD"),
);

app.use((error, req, res, next) => {
  res.status(500).json({ exito: false, mensaje: error.message });
});

export default app;
