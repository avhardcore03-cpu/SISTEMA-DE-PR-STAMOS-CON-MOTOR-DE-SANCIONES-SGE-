import React, { useState, useEffect } from "react";

export default function Prestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // Lo dejamos por si lo usas en otro lado
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [asignandoStrike, setAsignandoStrike] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [trigger, setTrigger] = useState(0);

  // 1️⃣ ACTUALIZAMOS EL ESTADO DEL FORMULARIO
  const [formData, setFormData] = useState({
    nombre_estudiante: "", // Campo de texto
    correo_estudiante: "", // Campo de texto
    id_equipo: "",         // Desplegable
    fecha_prestamo: "",
  });

  // 🔄 CARGAR DATOS AL MONTAR
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        
        // Obtener préstamos
        const respPrestamos = await fetch("http://localhost:5000/api/prestamos");
        if (respPrestamos.ok) {
          const dataPrestamos = await respPrestamos.json();
          setPrestamos(dataPrestamos.prestamos || dataPrestamos || []);
        } else {
          setPrestamos([]);
        }

        // Obtener equipos
        const respEquipos = await fetch("http://localhost:5000/api/secciones/equipos");
        if (respEquipos.ok) {
          const dataEquipos = await respEquipos.json();
          setEquipos(dataEquipos.equipos || dataEquipos || []);
        } else {
          setEquipos([]);
        }

      } catch (error) {
        console.error("Error de conexión al cargar datos:", error);
        setMensaje("❌ Error al conectar con el servidor.");
        setPrestamos([]);
        setEquipos([]);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [trigger]);

  // ✍️ MANEJAR CAMBIOS EN EL FORMULARIO
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🚀 CREAR NUEVO PRÉSTAMO
  const handleCrearPrestamo = async () => {
    // 2️⃣ VALIDAMOS LOS NUEVOS CAMPOS
    if (!formData.nombre_estudiante || !formData.correo_estudiante || !formData.id_equipo || !formData.fecha_prestamo) {
      setMensaje("❌ Completa todos los campos del formulario");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5000/api/prestamos/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        // 3️⃣ ENVIAMOS LOS DATOS COMO TEXTO (Verifica que tu backend reciba esto)
        body: JSON.stringify({
          nombre_estudiante: formData.nombre_estudiante,
          correo_estudiante: formData.correo_estudiante,
          id_equipo: parseInt(formData.id_equipo),
          fecha_prestamo: formData.fecha_prestamo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const fechaDev = data?.datos?.fecha_devolucion 
          ? new Date(data.datos.fecha_devolucion).toLocaleDateString() 
          : "Calculada por el sistema";

        setMensaje(`✅ Préstamo creado. Devolución: ${fechaDev}`);
        // 4️⃣ LIMPIAMOS EL FORMULARIO CON LOS NUEVOS CAMPOS
        setFormData({ nombre_estudiante: "", correo_estudiante: "", id_equipo: "", fecha_prestamo: "" });
        setShowForm(false);
        setTrigger((prev) => prev + 1);
        
        setTimeout(() => setMensaje(""), 3000);
      } else {
        setMensaje(`❌ ${data.mensaje || "Error al registrar el préstamo"}`);
      }
    } catch (error) {
      console.error("Error al crear préstamo:", error);
      setMensaje("❌ Error de conexión con el servidor");
    }
  };

  // ⚡ ASIGNAR STRIKE
  const handleAsignarStrike = async (id_prestamo) => {
    setAsignandoStrike({ ...asignandoStrike, [id_prestamo]: true });
    setMensaje("");

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:5000/api/prestamos/${id_prestamo}/strike`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMensaje(`⚠️ ${data.mensaje}`);
        setTimeout(() => {
          setTrigger((prev) => prev + 1);
          setTimeout(() => setMensaje(""), 3000);
        }, 800);
      } else {
        setMensaje(`❌ ${data.mensaje}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("❌ Error de conexión");
    } finally {
      setAsignandoStrike({ ...asignandoStrike, [id_prestamo]: false });
    }
  };

  const estaPrestamovencido = (fechaDevolucion) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(fechaDevolucion);
    fecha.setHours(0, 0, 0, 0);
    return hoy > fecha;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* ENCABEZADO */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Gestión de Préstamos</h1>
          <p className="text-gray-500 text-sm mt-2">
            Total de préstamos: {Array.isArray(prestamos) ? prestamos.length : 0} | Activos: {Array.isArray(prestamos) ? prestamos.filter((p) => p.estado === "PENDIENTE").length : 0}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#008c72] hover:bg-[#00705b] text-white px-6 py-3 rounded-lg font-bold transition-all active:scale-95"
          >
            + Crear Préstamo
          </button>
        )}
      </div>

      {/* MENSAJE DE FEEDBACK */}
      {mensaje && (
        <div className={`mb-6 p-4 rounded-lg border ${mensaje.includes("✅") ? "bg-green-100 border-green-300 text-green-700" : mensaje.includes("⚠️") ? "bg-yellow-100 border-yellow-300 text-yellow-700" : "bg-red-100 border-red-300 text-red-700"}`}>
          {mensaje}
        </div>
      )}

      {/* FORMULARIO ACTUALIZADO */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Registrar Nuevo Préstamo</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            
            {/* 5️⃣ NUEVO CAMPO: Nombre del estudiante (Texto) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre del Estudiante
              </label>
              <input
                type="text"
                name="nombre_estudiante"
                value={formData.nombre_estudiante}
                onChange={handleInputChange}
                placeholder="Ej. Juan Pérez"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008c72] focus:border-transparent"
              />
            </div>

            {/* 6️⃣ NUEVO CAMPO: Correo (Texto) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="correo_estudiante"
                value={formData.correo_estudiante}
                onChange={handleInputChange}
                placeholder="Ej. juan@ejemplo.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008c72] focus:border-transparent"
              />
            </div>

            {/* Equipo (Sigue siendo Desplegable) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Equipo a Prestar
              </label>
              <select
                name="id_equipo"
                value={formData.id_equipo}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008c72] focus:border-transparent"
              >
                <option value="">Selecciona un equipo</option>
                {Array.isArray(equipos) && equipos.length > 0 ? (
                  equipos.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre} (Stock: {e.stock_total})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No se pudieron cargar los equipos</option>
                )}
              </select>
            </div>

            {/* Fecha de préstamo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Fecha de Préstamo
              </label>
              <input
                type="date"
                name="fecha_prestamo"
                value={formData.fecha_prestamo}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008c72] focus:border-transparent"
              />
            </div>

            {/* Fecha de devolución calculada (solo lectura) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Fecha de Devolución (15 días hábiles)
              </label>
              <input
                type="text"
                disabled
                value={formData.fecha_prestamo ? "Calculada automáticamente por el sistema" : ""}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCrearPrestamo}
              className="bg-[#008c72] hover:bg-[#00705b] text-white px-6 py-2 rounded-lg font-bold transition-all active:scale-95"
            >
              Crear Préstamo
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({ nombre_estudiante: "", correo_estudiante: "", id_equipo: "", fecha_prestamo: "" });
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-bold transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* TABLA DE PRÉSTAMOS */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        {cargando ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 animate-pulse">Cargando préstamos...</p>
          </div>
        ) : !Array.isArray(prestamos) || prestamos.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-lg">✅ No hay préstamos registrados o no se pudieron cargar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Correo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Equipo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">F. Préstamo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">F. Devolución</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {prestamos.map((prestamo) => {
                  const vencido = prestamo.estado === "PENDIENTE" && estaPrestamovencido(prestamo.fecha_devolucion);
                  
                  return (
                    <tr key={prestamo.id_prestamo || prestamo.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${vencido ? "bg-red-50" : ""}`}>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-700 font-bold text-sm rounded-full">
                          {prestamo.id_prestamo || prestamo.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{prestamo.nombre_usuario}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{prestamo.email_usuario}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#008c72]">{prestamo.nombre_equipo}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(prestamo.fecha_prestamo).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        <span className={vencido ? "text-red-600" : "text-green-600"}>{new Date(prestamo.fecha_devolucion).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${prestamo.estado === "PENDIENTE" ? vencido ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                          {prestamo.estado === "PENDIENTE" && vencido && "⏰ "} {prestamo.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleAsignarStrike(prestamo.id_prestamo || prestamo.id)}
                          disabled={!vencido || asignandoStrike[prestamo.id_prestamo || prestamo.id]}
                          className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${!vencido ? "bg-gray-300 text-gray-500 cursor-not-allowed" : asignandoStrike[prestamo.id_prestamo || prestamo.id] ? "bg-orange-400 text-white animate-pulse" : "bg-orange-500 hover:bg-orange-600 text-white active:scale-95"}`}
                        >
                          {asignandoStrike[prestamo.id_prestamo || prestamo.id] ? "Asignando..." : "Asignar Strike"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}