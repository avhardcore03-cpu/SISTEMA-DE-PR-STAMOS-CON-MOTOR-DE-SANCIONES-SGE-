import { useState, useEffect } from "react";

const Prestamos = () => {
  const [inventario, setInventario] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [productoId, setProductoId] = useState("");
  const [usuario, setUsuario] = useState("");
  const [cantidad, setCantidad] = useState("");

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      const resInv = await fetch("http://localhost:3001/inventario");
      const resPre = await fetch("http://localhost:3001/prestamos");
      setInventario(await resInv.json());
      setPrestamos(await resPre.json());
    } catch (e) { console.error(e); }
  };

  const manejarPrestar = async () => {
    if (!productoId || !usuario || !cantidad) return alert("Completa los datos");
    try {
      const res = await fetch("http://localhost:3001/prestamos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productoId: Number(productoId), usuario, cantidad: Number(cantidad) }),
      });
      if (res.ok) { setProductoId(""); setUsuario(""); setCantidad(""); cargarTodo(); }
    } catch (e) { alert("Error"); }
  };

  const manejarDevolver = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/prestamos/${id}`, { method: "DELETE" });
      if (res.ok) cargarTodo();
    } catch (e) { alert("Error"); }
  };

  return (
    <div className="p-10 bg-[#f8fafc] min-h-screen font-sans text-slate-800">
      {/* Título con Estilo */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Gestión de Préstamos</h1>
        <p className="text-slate-500 mt-2 text-lg">Administra la salida y entrada de equipos del inventario.</p>
      </div>

      {/* Formulario Estilizado */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-10 flex flex-wrap lg:flex-nowrap gap-6 items-end transition-all hover:shadow-md">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Equipo a prestar</label>
          <select 
            className="w-full border-slate-200 border-2 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50"
            value={productoId} 
            onChange={e => setProductoId(e.target.value)}
          >
            <option value="">Selecciona un equipo...</option>
            {inventario.map(item => (
              <option key={item.id} value={item.id}>{item.nombre} (Disponibles: {item.cantidad})</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Usuario</label>
          <input 
            className="w-full border-slate-200 border-2 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
            placeholder="Ej. Juan Pérez" 
            value={usuario} 
            onChange={e => setUsuario(e.target.value)} 
          />
        </div>

        <div className="w-32">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Cantidad</label>
          <input 
            className="w-full border-slate-200 border-2 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
            type="number" 
            value={cantidad} 
            onChange={e => setCantidad(e.target.value)} 
          />
        </div>

        <button 
          onClick={manejarPrestar} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          Confirmar Préstamo
        </button>
      </div>

      {/* Grid de Tarjetas de Préstamos */}
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Equipos en Préstamo</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prestamos.length > 0 ? prestamos.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Activo</span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-1">{p.productoNombre}</h3>
            <p className="text-slate-600 mb-4 font-medium italic">Solicitado por: {p.usuario}</p>
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
              <span className="text-sm font-semibold text-slate-500 underline">Cant: {p.cantidad}</span>
              <button 
                onClick={() => manejarDevolver(p.id)} 
                className="text-red-500 hover:text-red-700 font-bold text-sm flex items-center gap-1 transition-colors"
              >
                <span>Devolver Equipo</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 font-medium">
            No hay préstamos activos en este momento.
          </div>
        )}
      </div>
    </div>
  );
};

export default Prestamos;