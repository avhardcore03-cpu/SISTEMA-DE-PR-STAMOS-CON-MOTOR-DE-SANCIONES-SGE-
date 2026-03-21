const Catalogo = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* HEADER: Título y Contador */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Catálogo de Equipos
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            Bienvenido, marian.cabana
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Equipos Disponibles
          </p>
          <p className="text-4xl font-black text-[#4ade80]">0</p>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="flex gap-4 mb-10">
        <div className="relative flex-1">
          <span className="absolute left-4 top-3 text-gray-300">🔍</span>
          <input
            type="text"
            placeholder="Buscar equipos..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#008c72]/20"
          />
        </div>
        <button className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-500 shadow-sm hover:bg-gray-50 transition-all">
          Filtrar
        </button>
      </div>

      {/* GRID DE TARJETAS (Vacío/Estructural) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* EJEMPLO DE UNA TARJETA (Para ver el diseño) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              {/* Icono del equipo */}
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 text-gray-400">
                {/* Aquí iría el icono */}
                <div className="w-6 h-6 bg-gray-200 rounded-md animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none mb-1">
                  CÓDIGO
                </p>
                <p className="text-[11px] text-gray-400 font-medium leading-none">
                  Categoría
                </p>
              </div>
            </div>

            {/* Badge de Estado */}
            <span className="px-3 py-1 rounded-full text-[9px] font-black tracking-tighter bg-green-100 text-green-600 border border-green-200 uppercase">
              Disponible
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-extrabold text-slate-700">
              Nombre del Equipo
            </h3>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <p className="text-[11px] text-gray-400 font-bold italic">
              Disponible para préstamo
            </p>
          </div>
        </div>
        {/* FIN DE TARJETA DE EJEMPLO */}
      </div>

      {/* MENSAJE DE ESPERA (Opcional) */}
      <div className="mt-20 text-center">
        <p className="text-gray-300 text-sm italic font-medium">
          No hay equipos cargados en el catálogo...
        </p>
      </div>
    </div>
  );
};

export default Catalogo;
