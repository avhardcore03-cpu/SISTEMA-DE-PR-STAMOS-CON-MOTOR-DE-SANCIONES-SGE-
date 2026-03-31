import express from "express";
// 🟢 AQUÍ ESTABA EL ERROR: Usamos TU archivo real de la carpeta database
import { prestamosDB, equiposDB } from "../database/db.js";

const router = express.Router();

/**
 * RUTAS DE SECCIONES (Responden a /api/secciones/...)
 */

// 1. Obtener Equipos
router.get("/equipos", (req, res) => {
  // Devolvemos tu array de equipos mockeados
  res.json(equiposDB || []);
});

// 2. Obtener Usuarios (Estudiantes)
router.get("/usuarios", (req, res) => {
  try {
    // OJO: Como antes no importabas usuariosDB, aquí te pongo una lista
    // temporal de prueba para que el Frontend deje de llorar y no se rompa.
    // Si tienes 'usuariosDB' en tu db.js, puedes importarlo arriba y usarlo aquí.
    const estudiantesPrueba = [
      {
        id: 1,
        nombre: "Juan Pérez",
        email: "juan@test.com",
        rol: "ESTUDIANTE",
      },
      {
        id: 2,
        nombre: "María Gómez",
        email: "maria@test.com",
        rol: "ESTUDIANTE",
      },
      {
        id: 3,
        nombre: "Carlos López",
        email: "carlos@test.com",
        rol: "ESTUDIANTE",
      },
    ];

    res.json(estudiantesPrueba);
  } catch (error) {
    res.status(500).json({ error: "Error al cargar estudiantes" });
  }
});

// 3. Obtener Préstamos
router.get("/prestamos", (req, res) => {
  // Devolvemos tu array de préstamos mockeados
  res.json(prestamosDB || []);
});

export default router;
