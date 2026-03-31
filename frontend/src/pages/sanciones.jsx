import React, { useState, useEffect } from "react";

export default function Sanciones() {
  const [sancionados, setSancionados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [perdonando, setPerdonando] = useState({});
  const [asignando, setAsignando] = useState({});
  const [actualizando, setActualizando] = useState(false); // 🔄 Estado para el updater
  const [mensaje, setMensaje] = useState("");
  const [trigger, setTrigger] = useState(0);

  const [dashboard, setDashboard] = useState({
    usuarios_sancionados: 0,
    suspendidos: 0,
    total_strikes: 0,
  });

  // ⭐ CARGAR DATOS
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [respDash, respSanc] = await Promise.all([
          fetch("http://localhost:3001/api/sanciones/dashboard"),
          fetch("http://localhost:3001/api/sanciones")
        ]);

        const dataDash = await respDash.json();
        const dataSanc = await respSanc.json();

        if (dataDash.exito) setDashboard(dataDash.datos);
        if (dataSanc.exito) setSancionados(dataSanc.datos || []);
      } catch (error) {
        console.error("Error al cargar:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [trigger]);

  // 🚀 BOTÓN UPDATER: Revisa préstamos vencidos y aplica sanciones
  const handleActualizarSanciones = async () => {
    setActualizando(true);
    setMensaje("");
    try {
      const response = await fetch("http://localhost:3001/api/sanciones/actualizar", {
        method: "POST", // O el método que use tu backend para procesar sanciones
      });

      if (response.ok) {
        setMensaje("✅ Sistema actualizado: Se procesaron nuevos retrasos y strikes.");
        setTrigger(prev => prev + 1);
      } else {
        setMensaje("❌ El servidor no pudo procesar la actualización.");
      }
    } catch (error) {
      setMensaje("❌ Error de conexión al motor de sanciones.");
    } finally {
      setActualizando(false);
      setTimeout(() => setMensaje(""), 4000);
    }
  };

  const handlePerdonar = async (usuarioId, nombreUsuario) => {
    setPerdonando({ ...perdonando, [usuarioId]: true });
    try {
      const res = await fetch(`http://localhost:3001/api/sanciones/perdonar/${usuarioId}`, { method: "PUT" });
      if (res.ok) {
        setMensaje(`✅ Sanciones limpias para ${nombreUsuario}.`);
        setTrigger(prev => prev + 1);
      }
    } catch (e) { setMensaje("❌ Error al perdonar"); }
    finally { setPerdonando({ ...perdonando, [usuarioId]: false }); }
  };

  const handleAsignarStrike = async (usuarioId, nombreUsuario) => {
    setAsignando({ ...asignando, [usuarioId]: true });
    try {
      const res = await fetch(`http://localhost:3001/api/usuarios/${usuarioId}/strike`, { method: "PUT" });
      if (res.ok) {
        setMensaje(`⚠️ Strike manual asignado a ${nombreUsuario}.`);
        setTrigger(prev => prev + 1);
      }
    } catch (e) { setMensaje("❌ Error al asignar strike"); }
    finally { setAsignando({ ...asignando, [usuarioId]: false }); }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Gestión de Sanciones</h1>
          <p className="text-gray-500 text-sm">Panel de control de penalizaciones y bloqueos.</p>
        </div>
        
        {/* BOTÓN PRO ACTUALIZADOR */}
        <button
          onClick={handleActualizarSanciones}
          disabled={actualizando}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
            actualizando ? "bg-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
          }`}
        >
          {actualizando ? "🔄 PROCESANDO..." : "⚡ ACTUALIZAR SANCIONES"}
        </button>
      </div>

      {mensaje && (
        <div className={`mb-6 p-4 rounded-xl border-l-4 shadow-sm animate-bounce ${mensaje.includes("✅") ? "bg-green-50 border-green-500 text-green-700" : "bg-red-50 border-red-500 text-red-700"}`}>
          {mensaje}
        </div>
      )}

      {/* Dashboard de Contadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "En la Mira", val: dashboard.usuarios_sancionados, color: "text-[#008c72]", bg: "bg-white" },
          { label: "Suspendidos", val: dashboard.suspendidos, color: "text-red-600", bg: "bg-red-50" },
          { label: "Strikes Totales", val: dashboard.total_strikes, color: "text-orange-500", bg: "bg-white" }
        ].map((item, i) => (
          <div key={i} className={`${item.bg} p-6 rounded-2xl border border-gray-200 shadow-sm transition-transform hover:scale-105`}>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.label}</p>
            <p className={`text-5xl font-black ${item.color} mt-2`}>{cargando ? "..." : item.val}</p>
          </div>
        ))}
      </div>

      {/* Tabla con Estilo Mejorado */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800 text-white text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Equipo Retenido</th>
              <th className="px-6 py-4">Strikes</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sancionados.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-700">{u.nombre}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                    {u.equipo_retenido}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    {[...Array(3)].map((_, i) => (
                      <span key={i} className={i < u.strikes ? "text-red-500" : "text-gray-200"}>⚠️</span>
                    ))}
                    <span className="ml-2 font-black text-slate-600">{u.strikes}/3</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button onClick={() => handleAsignarStrike(u.id, u.nombre)} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-600">+ Strike</button>
                  <button onClick={() => handlePerdonar(u.id, u.nombre)} className="bg-[#008c72] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-teal-700">Perdonar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}