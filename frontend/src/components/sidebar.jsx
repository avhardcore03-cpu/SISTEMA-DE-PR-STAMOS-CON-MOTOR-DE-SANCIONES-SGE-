import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const navigate = useNavigate();
  const [rol, setRol] = useState(null);

  // Extraer el rol del token
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRol(payload.rol);
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }
  }, []);

  // Función para cerrar sesión: elimina datos y redirige a login
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  // Si es estudiante, no mostrar sidebar (manejado en App.jsx)
  if (rol === "ESTUDIANTE") {
    return null;
  }

  return (
    <div className="w-64 h-screen bg-[#008c72] text-white flex flex-col p-6 fixed left-0 top-0 z-40">
      {/* Encabezado */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-1">Sistema de Gestión</h2>
        <p className="text-xs opacity-80">IU Digital de Antioquia</p>
      </div>

      {/* Menú de Navegación - Crece Dynamic */}
      <nav className="flex flex-col gap-4 flex-1">
        <Link
          to="/catalogo"
          className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200"
        >
          🗂️ Catálogo de Equipos
        </Link>
        <Link
          to="/inventario"
          className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          📦 Gestión de Inventario
        </Link>
        <Link
          to="/prestamos"
          className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          📋 Préstamos
        </Link>
        <Link
          to="/sanciones"
          className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          ⚠️ Sanciones
        </Link>
      </nav>

      {/* Botón de Cerrar Sesión - Anclado al Fondo */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-auto bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
      >
        🚪 Cerrar Sesión
      </button>
    </div>
  );
}
