import React, { useState, useEffect } from "react";

export default function CatalogoEstudiante() {
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [reservandoId, setReservandoId] = useState(null);

  // 🔄 CARGAR SOLO EQUIPOS DISPONIBLES
  const cargarEquipos = async () => {
    try {
      setCargando(true);
      const respEquipos = await fetch("http://localhost:3001/api/secciones/equipos");
      
      if (respEquipos.ok) {
        const dataEquipos = await respEquipos.json();
        
        // 1. Extraer el array sin importar cómo lo envíe el backend
        const todosLosEquipos = Array.isArray(dataEquipos) ? dataEquipos : (dataEquipos.equipos || []);
        console.log("Datos que llegaron del backend:", todosLosEquipos); // Útil para depurar con F12
        
        // 2. FILTRO BLINDADO: Ignora mayúsculas/minúsculas
        const disponibles = todosLosEquipos.filter((equipo) => {
          const estado = equipo.estado ? String(equipo.estado).toUpperCase() : "";
          // Verifica si dice DISPONIBLE o si tiene stock
          return estado === "DISPONIBLE" || equipo.stock_total > 0;
        });
        
        // 3. RED DE SEGURIDAD: Si el filtro borró todo pero SÍ hay equipos, mostramos todos
        if (disponibles.length === 0 && todosLosEquipos.length > 0) {
          console.warn("⚠️ Ningún equipo dice 'DISPONIBLE', pero llegaron datos. Mostrando todos para pruebas.");
          setEquiposDisponibles(todosLosEquipos);
        } else {
          setEquiposDisponibles(disponibles);
        }
        
      } else {
        throw new Error("El servidor respondió con error.");
      }
    } catch (error) {
      console.error("Error al cargar catálogo:", error);
      setMensaje("❌ Error al cargar el catálogo de equipos.");
      setEquiposDisponibles([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEquipos();
  }, []);

  // 🚀 LÓGICA DE RESERVA
  const handleReservar = async (id_equipo, nombre_equipo) => {
    if (!window.confirm(`¿Estás seguro de que deseas reservar el equipo: ${nombre_equipo}?`)) {
      return;
    }

    setReservandoId(id_equipo);
    setMensaje("");

    try {
      const token = localStorage.getItem("authToken");
      // Ojo: Asegúrate de que esta URL exista en tu backend para hacer las reservas
      const response = await fetch(`http://localhost:3001/api/reservas/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ id_equipo: id_equipo }),
      });

      // Intentamos procesar el JSON de respuesta de forma segura
      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        console.warn("La respuesta no es un JSON válido");
      }

      if (response.ok) {
        setMensaje(`✅ ¡Reserva confirmada! Acércate al almacén para retirar tu ${nombre_equipo}.`);
        cargarEquipos(); // Recargamos para actualizar el catálogo
      } else {
        setMensaje(`❌ ${data.mensaje || data.error || "Error al realizar la reserva"}`);
      }
    } catch (error) {
      console.error("Error reservando:", error);
      setMensaje("❌ Error de conexión al intentar reservar.");
    } finally {
      setReservandoId(null);
      setTimeout(() => setMensaje(""), 3001); // El mensaje desaparece a los 5 segundos
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Catálogo de Equipos</h1>
        <p className="text-gray-500 mt-2">
          Reserva el equipo que necesitas. Tienes 2 horas para retirarlo antes de que se cancele la reserva.
        </p>
      </div>

      {mensaje && (
        <div className={`mb-6 p-4 rounded-lg font-medium border ${mensaje.includes("✅") ? "bg-green-100 border-green-300 text-green-800" : "bg-red-100 border-red-300 text-red-800"}`}>
          {mensaje}
        </div>
      )}

      {cargando ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-gray-500 animate-pulse text-lg">Cargando equipos disponibles...</p>
        </div>
      ) : equiposDisponibles.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-200">
          <span className="text-4xl block mb-4">📭</span>
          <p className="text-gray-500 text-lg">Actualmente no hay equipos disponibles para reserva.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equiposDisponibles.map((equipo) => (
            <div key={equipo.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              
              <div className="h-40 bg-[#008c72] opacity-80 flex items-center justify-center">
                <span className="text-white text-5xl">💻</span>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{equipo.nombre}</h3>
                
                <div className="text-sm text-gray-600 mb-6 space-y-1">
                  {/* Validamos que stock_total exista, si no ponemos N/A */}
                  <p><strong>Stock disponible:</strong> {equipo.stock_total !== undefined ? equipo.stock_total : "N/A"}</p>
                  <p><strong>Estado:</strong> <span className="text-green-600 font-semibold">{equipo.estado || "Disponible"}</span></p>
                </div>

                <button
                  onClick={() => handleReservar(equipo.id, equipo.nombre)}
                  disabled={reservandoId === equipo.id}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all active:scale-95 ${
                    reservandoId === equipo.id 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-[#008c72] hover:bg-[#00705b]"
                  }`}
                >
                  {reservandoId === equipo.id ? "Reservando..." : "Reservar Equipo"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}