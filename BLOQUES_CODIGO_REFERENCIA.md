# 🔧 BLOQUES DE CÓDIGO - REFERENCIA RÁPIDA

Aquí están los fragmentos exactos que se agregaron/modificaron. Puedes copiarlos tal cual.

---

## BLOQUE 1: db.js - Nuevos Usuarios (5 Estudiantes)

```javascript
// ⭐ ESTUDIANTE 1: SUSPENDIDO - 3 Strikes (Retraso en devolución)
{
  id: 4,
  nombre: "Lina Campos",
  email: "lina.campos@example.com",
  password: "$2a$10$89X70VtgZp6M/pOCInS7reVnS6WAnWv9SHe9G.Zf8A97.Xf.0p39a", // password123
  rol: "ESTUDIANTE",
  estado: "SUSPENDIDO",
  strikes: 3,
  fechaCreacion: new Date("2024-01-20")
},
// ⭐ ESTUDIANTE 2: SUSPENDIDO - 3 Strikes (Retraso en devolución)
{
  id: 5,
  nombre: "Diego Morales",
  email: "diego.morales@example.com",
  password: "$2a$10$89X70VtgZp6M/pOCInS7reVnS6WAnWv9SHe9G.Zf8A97.Xf.0p39a", // password123
  rol: "ESTUDIANTE",
  estado: "SUSPENDIDO",
  strikes: 3,
  fechaCreacion: new Date("2024-01-25")
},
// ⭐ ESTUDIANTE 3: ACTIVO - 2 Strikes
{
  id: 6,
  nombre: "Paula Guzmán",
  email: "paula.guzman@example.com",
  password: "$2a$10$89X70VtgZp6M/pOCInS7reVnS6WAnWv9SHe9G.Zf8A97.Xf.0p39a", // password123
  rol: "ESTUDIANTE",
  estado: "ACTIVO",
  strikes: 2,
  fechaCreacion: new Date("2024-02-01")
},
// ⭐ ESTUDIANTE 4: ACTIVO - 1 Strike
{
  id: 7,
  nombre: "Roberto Soto",
  email: "roberto.soto@example.com",
  password: "$2a$10$89X70VtgZp6M/pOCInS7reVnS6WAnWv9SHe9G.Zf8A97.Xf.0p39a", // password123
  rol: "ESTUDIANTE",
  estado: "ACTIVO",
  strikes: 1,
  fechaCreacion: new Date("2024-02-10")
},
// ⭐ ESTUDIANTE 5: ACTIVO - 0 Strikes (Sin problemas)
{
  id: 8,
  nombre: "Andrea López",
  email: "andrea.lopez@example.com",
  password: "$2a$10$89X70VtgZp6M/pOCInS7reVnS6WAnWv9SHe9G.Zf8A97.Xf.0p39a", // password123
  rol: "ESTUDIANTE",
  estado: "ACTIVO",
  strikes: 0,
  fechaCreacion: new Date("2024-02-15")
}
```

---

## BLOQUE 2: db.js - Función Equipo Retenido

```javascript
/**
 * Obtiene el equipo retenido (PENDIENTE) de un usuario
 * Se usa en el módulo de sanciones
 */
export const obtenerEquipoRetenidoPorUsuario = (id_usuario) => {
  const prestamo = prestamosDB.find(p => 
    p.id_usuario === id_usuario && p.estado === 'PENDIENTE'
  );
  return prestamo ? prestamo.nombre_equipo : null;
};
```

---

## BLOQUE 3: catalogoController.js - Calcular Disponibilidad Real

```javascript
// Dentro de obtenerCatalogo()
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
```

---

## BLOQUE 4: sancionesController.js - Mapear con Equipo Retenido

```javascript
// Dentro de obtenerSancionados()
const usuariosConEquipo = usuariosSancionados.map(user => ({
  id: user.id,
  nombre: user.nombre,
  email: user.email,
  rol: user.rol,
  strikes: user.strikes,
  estado: user.estado,
  fechaCreacion: user.fechaCreacion,
  equipoRetenido: obtenerEquipoRetenidoPorUsuario(user.id) || "N/A"
}));

return res.status(200).json({
  exito: true,
  cantidad: usuariosConEquipo.length,
  datos: usuariosConEquipo
});
```

---

## BLOQUE 5: authController.js - Nueva Función Obtener Usuario

```javascript
/**
 * GET /api/usuarios/:id
 * Obtiene la información de un usuario por su ID
 */
export const obtenerUsuario = (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        exito: false, 
        mensaje: 'ID de usuario requerido.' 
      });
    }
    
    const usuario = obtenerUsuarioPorId(parseInt(id));
    
    if (!usuario) {
      return res.status(404).json({ 
        exito: false, 
        mensaje: `Usuario con ID ${id} no encontrado.` 
      });
    }
    
    return res.status(200).json({ 
      exito: true, 
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      estado: usuario.estado,
      strikes: usuario.strikes,
      fechaCreacion: usuario.fechaCreacion
    });
    
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return res.status(500).json({ 
      exito: false, 
      mensaje: 'Error al obtener usuario',
      error: error.message
    });
  }
};
```

---

## BLOQUE 6: catalogo.jsx - Estado del Usuario

```javascript
const [estadoUsuario, setEstadoUsuario] = useState("ACTIVO");

// En useEffect al cargar:
const cargarEstadoUsuario = async () => {
  try {
    const response = await fetch(`http://localhost:3001/api/usuarios/${payload.id}`);
    if (response.ok) {
      const data = await response.json();
      setEstadoUsuario(data.estado || "ACTIVO");
    }
  } catch (error) {
    console.error("Error al obtener estado del usuario:", error);
    setEstadoUsuario("ACTIVO");
  }
};

cargarEstadoUsuario();
```

---

## BLOQUE 7: catalogo.jsx - Banner Suspensión

```jsx
{esEstudiante && estadoUsuario === "SUSPENDIDO" && (
  <div className="mb-6 p-5 bg-red-50 border-2 border-red-400 rounded-lg flex items-start gap-4">
    <span className="text-3xl flex-shrink-0">🚫</span>
    <div>
      <h3 className="font-bold text-red-700 text-lg mb-1">
        Tu cuenta está suspendida
      </h3>
      <p className="text-red-600 text-sm mb-2">
        Por favor devuelve los equipos pendientes o contacta al administrador 
        para reactivar tu acceso.
      </p>
      <p className="text-xs text-red-500 italic">
        Se han acumulado múltiples retrasos en devoluciones. Esto ha resultado 
        en la suspensión temporal de tu cuenta.
      </p>
    </div>
  </div>
)}
```

---

## BLOQUE 8: catalogo.jsx - Botón Dinámico

```jsx
{esEstudiante && (
  <button
    onClick={() => handleSolicitar(equipo.id, equipo.nombre)}
    disabled={
      solicitudEnProceso[equipo.id] ||
      equipo.estado !== "Disponible" ||
      estadoUsuario === "SUSPENDIDO"
    }
    className={`w-full py-2 px-4 rounded-lg text-sm font-bold transition-all ${
      estadoUsuario === "SUSPENDIDO"
        ? "bg-red-100 text-red-500 cursor-not-allowed border border-red-300"
        : equipo.estado !== "Disponible"
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : solicitudEnProceso[equipo.id]
            ? "bg-blue-400 text-white animate-pulse"
            : "bg-[#008c72] hover:bg-[#006b56] text-white"
    }`}
    title={estadoUsuario === "SUSPENDIDO" ? "Tu cuenta está suspendida" : ""}
  >
    {estadoUsuario === "SUSPENDIDO"
      ? "Cuenta Suspendida"
      : solicitudEnProceso[equipo.id]
        ? "Solicitando..."
        : equipo.estado === "Disponible"
          ? "Solicitar"
          : "No disponible"}
  </button>
)}
```

---

## BLOQUE 9: sanciones.jsx - Columna Equipo Retenido

```jsx
{/* Equipo Retenido */}
<td className="px-6 py-4">
  <p className="text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
    {usuario.equipoRetenido}
  </p>
</td>
```

---

**Todos estos bloques ya están implementados en los archivos. Solo es para referencia. 🎉**
