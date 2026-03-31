import { useState, useEffect } from "react";

const Inventario = () => {
  const [equipos, setEquipos] = useState([]);
  const [form, setForm] = useState({ nombre: "", categoria: "", cantidad: "" });
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const API_INV = "http://localhost:3001/api/inventario";

  useEffect(() => { cargarEquipos(); }, []);

  const cargarEquipos = async () => {
    try {
      const res = await fetch(API_INV);
      if (res.ok) setEquipos(await res.json());
    } catch (e) { console.error("Error cargando inventario", e); }
  };

  const guardarEquipo = async (e) => {
    e.preventDefault();
    const metodo = editandoId ? "PUT" : "POST";
    const url = editandoId ? `${API_INV}/${editandoId}` : API_INV;

    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, cantidad: Number(form.cantidad) }),
    });

    if (res.ok) {
      setForm({ nombre: "", categoria: "", cantidad: "" });
      setEditandoId(null);
      cargarEquipos();
    }
  };

  const eliminarEquipo = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este equipo del sistema?")) return;
    const res = await fetch(`${API_INV}/${id}`, { method: "DELETE" });
    if (res.ok) cargarEquipos();
  };

  const prepararEdicion = (eq) => {
    setEditandoId(eq.id);
    setForm({ nombre: eq.nombre, categoria: eq.categoria, cantidad: eq.cantidad });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtrado para la barra de búsqueda
  const equiposFiltrados = equipos.filter(eq => 
    eq.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-800 ml-64">
      {/* Header con Stats */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Control de Inventario</h1>
          <p className="text-slate-500 mt-1">Gestiona el stock de equipos tecnológicos de la institución.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 text-center min-w-[120px]">
            <span className="block text-2xl font-bold text-emerald-600">{equipos.length}</span>
            <span className="text-xs text-slate-400 font-bold uppercase">Modelos</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 text-center min-w-[120px]">
            <span className="block text-2xl font-bold text-blue-600">
              {equipos.reduce((acc, curr) => acc + Number(curr.cantidad), 0)}
            </span>
            <span className="text-xs text-slate-400 font-bold uppercase">Items Total</span>
          </div>
        </div>
      </div>

      {/* Formulario de Registro/Edición */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 transition-all hover:shadow-md">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          {editandoId ? "📝 Editando Equipo" : "➕ Registrar Nuevo Equipo"}
        </h2>
        <form onSubmit={guardarEquipo} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Nombre del Equipo</label>
            <input 
              className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="Ej: MacBook Pro"
              value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Categoría</label>
            <select 
              className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} required
            >
              <option value="">Seleccionar...</option>
              <option value="Laptops">Laptops</option>
              <option value="Periféricos">Periféricos</option>
              <option value="Audiovisual">Audiovisual</option>
              <option value="Redes">Redes</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Stock Inicial</label>
            <input 
              type="number" className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} required 
            />
          </div>
          <div className="flex gap-2">
            <button className={`flex-1 p-3 rounded-xl font-bold text-white transition-all active:scale-95 shadow-lg ${editandoId ? 'bg-orange-500 shadow-orange-100' : 'bg-emerald-600 shadow-emerald-100'}`}>
              {editandoId ? "Actualizar" : "Guardar Equipo"}
            </button>
            {editandoId && (
              <button type="button" onClick={() => {setEditandoId(null); setForm({nombre:"", categoria:"", cantidad:""})}} className="p-3 bg-slate-200 text-slate-600 rounded-xl font-bold">Cancelar</button>
            )}
          </div>
        </form>
      </div>

      {/* Tabla de Datos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-700">Listado de Equipos</h3>
          <input 
            className="p-2 px-4 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-500 w-64"
            placeholder="Buscar por nombre..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase font-bold tracking-widest">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4 text-slate-600">Equipo</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {equiposFiltrados.map(eq => (
              <tr key={eq.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-4 text-slate-400 text-sm">#{eq.id}</td>
                <td className="p-4 font-bold text-slate-900">{eq.nombre}</td>
                <td className="p-4">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                    {eq.categoria}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${eq.cantidad > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className="font-mono font-bold">{eq.cantidad}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => prepararEdicion(eq)} className="text-blue-500 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
                      <span>Editar</span>
                    </button>
                    <button onClick={() => eliminarEquipo(eq.id)} className="text-red-400 hover:text-red-600 text-sm font-bold flex items-center gap-1">
                      <span>Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventario;