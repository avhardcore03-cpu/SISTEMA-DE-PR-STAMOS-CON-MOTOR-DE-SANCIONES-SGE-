import React, { useState, useEffect } from "react";

const Catalogo = () => {
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  const normalizarTexto = (valor) =>
    String(valor ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  // 1. Cargar datos desde el json-server
  useEffect(() => {
    fetch("http://localhost:5000/catalogo")
      .then((res) => res.json())
      .then((data) => {
        setEquipos(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al cargar el JSON:", err);
        setCargando(false);
      });
  }, []);

  const categorias = [
    "Todos",
    "Computadoras",
    "Audio/Video",
    "Tablets",
    "Fotografía",
  ];

  // 2. Lógica de Filtrado (Afecta a todos los elementos del array)
  const busquedaNormalizada = normalizarTexto(busqueda);
  const equiposFiltrados = equipos.filter((equipo) => {
    const coincideCategoria =
      filtroActivo === "Todos" ||
      normalizarTexto(equipo.tipo) === normalizarTexto(filtroActivo);
    const coincideBusqueda =
      normalizarTexto(equipo.nombre).includes(busquedaNormalizada) ||
      normalizarTexto(equipo.id).includes(busquedaNormalizada) ||
      normalizarTexto(equipo.tipo).includes(busquedaNormalizada);
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Catálogo de Equipos
          </h1>
          <p className="text-gray-500 text-sm">Bienvenido, marian.cabana</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Equipos Disponibles
          </p>
          <p className="text-4xl font-black text-[#008c72]">
            {equipos.filter((e) => e.estado === "Disponible").length}
          </p>
        </div>
      </div>

      {/* Buscador y Botones de Filtro */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="relative flex-1 min-w-75">
          <span className="absolute left-4 top-2.5 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o ID..."
            className="w-full pl-11 pr-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#008c72]/20"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltroActivo(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                filtroActivo === cat
                  ? "bg-[#008c72] text-white border-[#008c72]"
                  : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Dinámico (Aquí es donde ocurre la magia) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cargando ? (
          <p className="col-span-3 text-center py-20 text-gray-400 animate-pulse">
            Cargando equipos...
          </p>
        ) : equiposFiltrados.length > 0 ? (
          // SOLO ESTE .MAP RENDERIZA LAS TARJETAS. No hay nada manual arriba.
          equiposFiltrados.map((equipo, index) => (
            <div
              key={`${equipo.id}-${index}`}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border border-gray-100 group-hover:scale-105 transition-transform">
                    {equipo.icono}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">
                      {equipo.id}
                    </p>
                    <p className="text-[11px] text-gray-400 font-bold leading-none">
                      {equipo.tipo}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-tighter ${
                    equipo.estado === "Disponible"
                      ? "bg-green-100 text-green-600 border-green-200"
                      : equipo.estado === "En Mantenimiento"
                        ? "bg-gray-100 text-gray-500 border-gray-200"
                        : "bg-orange-100 text-orange-600 border-orange-200"
                  }`}
                >
                  {equipo.estado}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-slate-700 mb-2">
                {equipo.nombre}
              </h3>
              <p className="text-[11px] text-gray-400 mb-6 leading-relaxed line-clamp-2 italic">
                {equipo.descripcion}
              </p>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${equipo.estado === "Disponible" ? "bg-green-400" : "bg-orange-400"}`}
                />
                <p className="text-[11px] text-gray-400 font-bold italic">
                  {equipo.estado === "Disponible"
                    ? "Disponible para préstamo"
                    : "No disponible actualmente"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-medium italic">
              No se encontraron resultados para esta búsqueda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogo;
