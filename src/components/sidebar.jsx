import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="w-64 h-screen bg-[#008c72] text-white flex flex-col p-6 fixed left-0 top-0">
      <h2 className="text-xl font-bold mb-1">Sistema de Gestión</h2>
      <p className="text-xs mb-10 opacity-80">IU Digital de Antioquia</p>

      <nav className="flex flex-col gap-4 grow">
        <Link
          to="/inventario"
          className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
        >
          📦 Gestión de Inventario
        </Link>
        <Link
          to="/prestamos"
          className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-all"
        >
          📋 Préstamos
        </Link>
        <Link
          to="/sanciones"
          className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-all"
        >
          ⚠️ Sanciones
        </Link>
      </nav>

      <button
        onClick={() => navigate("/")}
        className="mt-auto flex items-center gap-3 p-3 text-red-200 hover:text-white transition-all"
      >
        Logout
      </button>
    </div>
  );
}
