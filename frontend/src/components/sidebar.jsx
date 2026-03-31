import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const navigate = useNavigate();
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userString = localStorage.getItem("user"); // Intentamos leer el objeto usuario directamente

    if (token === "token-de-emergencia-12345") {
      // SI ES EL TOKEN DE PRUEBA: No usamos atob, leemos el rol del objeto user
      if (userString) {
        const userData = JSON.parse(userString);
        setRol(userData.role || "ADMIN");
      } else {
        setRol("ADMIN"); // Por defecto si no hay objeto
      }
    } else if (token) {
      // SI ES UN TOKEN REAL DE ANDRÉS: Usamos la decodificación normal
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRol(payload.rol || payload.role);
      } catch (error) {
        console.error("Error al decodificar el token real:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user"); // Limpiamos user
    localStorage.removeItem("usuario");
    navigate("/");
  };

  // Si es estudiante, no mostrar el sidebar (se maneja también en App.jsx)
  if (rol === "ESTUDIANTE") {
    return null;
  }

  return (
    <div className="w-64 h-screen bg-[#008c72] text-white flex flex-col p-6 fixed left-0 top-0 z-40 shadow-2xl">
      {/* Encabezado */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-1">Sistema de Gestión</h2>
        <p className="text-xs opacity-80">IU Digital de Antioquia</p>
        {rol && (
          <span className="mt-2 inline-block bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase">
            Sesión: {rol}
          </span>
        )}
      </div>

      {/* Menú de Navegación */}
      <nav className="flex flex-col gap-4 flex-1">
        <Link
          to="/catalogo"
          className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200"
        >
          🗂️ Catálogo de Equipos
        </Link>

        {/* Solo mostrar Gestión e Inventario si es ADMIN */}
        {rol === "ADMIN" && (
          <>
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
            <Link
              to="/usuarios"
              className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              👥 Usuarios
            </Link>
          </>
        )}
      </nav>

      {/* Botón de Cerrar Sesión */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-auto bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all duration-200 shadow-lg active:scale-95"
      >
        🚪 Cerrar Sesión
      </button>
    </div>
  );
}
