/**
 * Configuración Principal de la Aplicación Express - INTEGRACIÓN TOTAL CON SANCIONES
 * FIX: CRUD DE INVENTARIO (PUT) Y LÓGICA DE STRIKES
 */

import express from "express";
import cors from "cors";

const app = express();

// ===== DATOS EN MEMORIA ACTUALIZADOS =====
let miInventario = [
  {
    id: 1,
    nombre: "Laptop Dell",
    categoria: "Laptops",
    cantidad: 3,
    estado: "Disponible",
  },
  {
    id: 2,
    nombre: "Mouse Logitech",
    categoria: "Periféricos",
    cantidad: 8,
    estado: "Disponible",
  },
  {
    id: 3,
    nombre: "Teclado Mecánico",
    categoria: "Periféricos",
    cantidad: 7,
    estado: "Disponible",
  },
];

let misPrestamos = [
  {
    id: 1001,
    id_usuario: 2,
    productoId: 1,
    productoNombre: "Laptop Dell",
    usuario: "AnaActiva",
    cantidad: 1,
    fecha_salida: "2026-03-25",
    fecha_pactada: "2026-04-05",
    estado: "Pendiente",
  },
  {
    id: 1002,
    id_usuario: 3,
    productoId: 2,
    productoNombre: "Mouse Logitech",
    usuario: "CarlosSuspendido",
    cantidad: 1,
    fecha_salida: "2026-03-10",
    fecha_pactada: "2026-03-15",
    estado: "Pendiente",
  },
  {
    id: 1003,
    id_usuario: 4,
    productoId: 1,
    productoNombre: "Laptop Dell",
    usuario: "MartaSuspendida",
    cantidad: 1,
    fecha_salida: "2026-03-12",
    fecha_pactada: "2026-03-22",
    estado: "Pendiente",
  },
  {
    id: 1004,
    id_usuario: 5,
    productoId: 3,
    productoNombre: "Teclado Mecánico",
    usuario: "JuanSuspendido",
    cantidad: 1,
    fecha_salida: "2026-03-14",
    fecha_pactada: "2026-03-24",
    estado: "Pendiente",
  },
  {
    id: 1005,
    id_usuario: 2,
    productoId: 2,
    productoNombre: "Mouse Logitech",
    usuario: "AnaActiva",
    cantidad: 1,
    fecha_salida: "2026-03-28",
    fecha_pactada: "2026-04-08",
    estado: "Pendiente",
  },
];

// Simulamos una base de usuarios para controlar los Strikes y el Bloqueo
let usuariosDB = [
  {
    id: 1,
    username: "AdminDemo",
    email: "admin@example.com",
    password: "admin",
    rol: "ADMIN",
    strikes: 0,
    estado: "ACTIVO",
  },
  {
    id: 2,
    username: "AnaActiva",
    email: "ana.activa@example.com",
    password: "password123",
    rol: "ESTUDIANTE",
    strikes: 0,
    estado: "ACTIVO",
  },
  {
    id: 3,
    username: "CarlosSuspendido",
    email: "carlos.ramirez@example.com",
    password: "password123",
    rol: "ESTUDIANTE",
    strikes: 0,
    estado: "ACTIVO",
  },
  {
    id: 4,
    username: "MartaSuspendida",
    email: "marta.sanchez@example.com",
    password: "password123",
    rol: "ESTUDIANTE",
    strikes: 1,
    estado: "OBSERVACIÓN",
  },
  {
    id: 5,
    username: "JuanSuspendido",
    email: "juan.perez@example.com",
    password: "password123",
    rol: "ESTUDIANTE",
    strikes: 2,
    estado: "ADVERTENCIA",
  },
];

const obtenerUsuarioDemoPrestamo = () =>
  usuariosDB.find((u) => u.rol === "ESTUDIANTE") || usuariosDB[0];

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
  const { productoId, usuario, cantidad, productoNombre, fecha_pactada } =
    req.body;

  const userCheck = obtenerUsuarioDemoPrestamo();
  if (userCheck.estado === "SUSPENDIDO" || userCheck.strikes >= 3) {
    return res.status(403).json({
      mensaje: "⛔ BLOQUEO: El usuario está SUSPENDIDO por exceso de strikes.",
    });
  }

  const producto = miInventario.find((p) => p.id === Number(productoId));

  if (producto && producto.cantidad >= cantidad) {
    producto.cantidad -= cantidad;
    const nuevoPrestamo = {
      id: Date.now(),
      productoId,
      productoNombre,
      usuario,
      cantidad,
      fecha_salida: new Date().toISOString().split("T")[0],
      fecha_pactada: fecha_pactada,
      estado: "Pendiente",
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
        email: `${u.username.toLowerCase()}@demo.local`,
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
  usuariosDB = usuariosDB.map((u) => ({
    ...u,
    estado: calcularEstadoPorStrikes(u.strikes),
  }));

  return res.status(200).json({
    exito: true,
    mensaje: "Estados de sanciones actualizados en RAM.",
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
