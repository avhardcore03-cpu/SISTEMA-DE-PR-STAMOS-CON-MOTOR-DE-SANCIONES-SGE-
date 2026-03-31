import { useState, useEffect } from "react";

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");

  // Usamos una variable para no repetir la URL siempre
  const API_URL = "http://localhost:3001/api/inventario";

  useEffect(() => {
    obtenerInventario();
  }, []);

  const obtenerInventario = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error en la respuesta");
      const datos = await res.json();
      setProductos(datos);
    } catch (e) { 
      console.error("Error al cargar inventario", e); 
    }
  };

  const agregarProducto = async () => {
    if (!nombre || !cantidad) return alert("Por favor, completa los campos");
    
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nombre, 
          cantidad: Number(cantidad),
          estado: "Disponible" // Agregamos un estado por defecto
        }),
      });

      if (res.ok) {
        setNombre(""); 
        setCantidad("");
        obtenerInventario(); // Recargamos la lista
        alert("¡Equipo registrado con éxito!");
      } else {
        alert("El servidor no pudo registrar el equipo");
      }
    } catch (e) { 
      alert("Error al conectar con el servidor (3001)"); 
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este equipo?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        obtenerInventario();
      }
    } catch (e) { 
      alert("Error al eliminar"); 
    }
  };

  return (
    <div className="p-10 bg-[#f8fafc] min-h-screen font-sans text-slate-800">
      {/* Encabezado */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Control de Inventario</h1>
        <p className="text-slate-500 mt-2 text-lg">Agrega nuevos equipos y gestiona las existencias disponibles.</p>
      </div>

      {/* Formulario de Entrada */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-10 flex flex-wrap gap-6 items-end transition-all hover:shadow-md">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Equipo</label>
          <input 
            className="w-full border-slate-200 border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 transition-all"
            placeholder="Ej. Cámara Canon EOS" 
            value={nombre} 
            onChange={e => setNombre(e.target.value)} 
          />
        </div>

        <div className="w-40">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Stock Inicial</label>
          <input 
            className="w-full border-slate-200 border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
            type="number" 
            placeholder="0"
            value={cantidad} 
            onChange={e => setCantidad(e.target.value)} 
          />
        </div>

        <button 
          onClick={agregarProducto} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Registrar Equipo
        </button>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-5 text-sm font-bold text-slate-600 uppercase tracking-wider">Equipo</th>
              <th className="p-5 text-sm font-bold text-slate-600 uppercase tracking-wider text-center">Estado de Stock</th>
              <th className="p-5 text-sm font-bold text-slate-600 uppercase tracking-wider text-center">Cantidad</th>
              <th className="p-5 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productos.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                      {item.nombre ? item.nombre.charAt(0).toUpperCase() : "?"}
                    </div>
                    <span className="font-semibold text-slate-900">{item.nombre}</span>
                  </div>
                </td>
                <td className="p-5 text-center">
                  {item.cantidad <= 2 ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">Bajo Stock</span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600">Disponible</span>
                  )}
                </td>
                <td className="p-5 text-center font-mono font-bold text-lg text-slate-700">
                  {item.cantidad}
                </td>
                <td className="p-5 text-right">
                  <button 
                    onClick={() => eliminarProducto(item.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {productos.length === 0 && (
          <div className="p-20 text-center text-slate-400 font-medium italic">
            No hay equipos registrados en el inventario todavía.
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventario;