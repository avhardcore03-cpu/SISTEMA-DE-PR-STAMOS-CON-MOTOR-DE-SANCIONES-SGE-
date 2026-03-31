import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";

// ===== IMPORTACIÓN DE PÁGINAS (Corregidas para evitar errores de ruta) =====
import Login from "./pages/login";
import Inventario from "./pages/inventario";
import Prestamos from "./pages/prestamos";
import Sanciones from "./pages/sanciones";
import Catalogo from "./pages/catalogo";

function App() {
  const location = useLocation();
  const [user, setUser] = useState(null); // Guardamos el objeto usuario completo
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 1. Extraemos los datos del almacenamiento local
    const savedUser = JSON.parse(
      localStorage.getItem("user") || localStorage.getItem("usuario") || "null",
    );
    const token = localStorage.getItem("authToken");

    if (savedUser) {
      setUser(savedUser);
    } else if (token) {
      // Si hay token pero no hay usuario persistido, evitamos asumir rol ADMIN.
      setUser(null);
    } else {
      setUser(null);
    }
    setCargando(false);
  }, [location]);

  // Lógica de permisos y bloqueos
  const rol = user?.role;
  const esEstudiante = rol === "ESTUDIANTE";

  // No mostrar el Sidebar en Login o si no hay sesión
  const mostrarSidebar = location.pathname !== "/" && user !== null;
  const margenIzquierdo = mostrarSidebar ? "pl-64" : "";

  if (cargando)
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando sistema...
      </div>
    );

  return (
    <div className="flex">
      {/* El Sidebar recibe el rol y el estado para saber si bloquear funciones */}
      {mostrarSidebar && <Sidebar rol={rol} />}

      <main className={`flex-1 ${margenIzquierdo} min-h-screen bg-gray-50`}>
        <Routes>
          {/* RUTA PÚBLICA */}
          <Route path="/" element={<Login />} />

          {/* RUTAS PROTEGIDAS */}
          {user ? (
            <>
              {/* Si el estudiante está suspendido, podrías redirigirlo a una página de aviso, 
                  pero aquí lo dejamos entrar al catálogo para que vea sus sanciones */}
              <Route
                path="/catalogo"
                element={<Catalogo esEstudiante={esEstudiante} />}
              />

              {/* SECCIONES DE ADMINISTRACIÓN */}
              <Route
                path="/inventario"
                element={
                  esEstudiante ? (
                    <Navigate to="/catalogo" replace />
                  ) : (
                    <Inventario />
                  )
                }
              />

              {/* Pasamos el estado al componente de préstamos para que bloquee el botón de "Prestar" */}
              <Route
                path="/prestamos"
                element={
                  esEstudiante ? (
                    <Navigate to="/catalogo" replace />
                  ) : (
                    <Prestamos userStatus={user.estado} />
                  )
                }
              />

              <Route
                path="/sanciones"
                element={
                  esEstudiante ? (
                    <Navigate to="/catalogo" replace />
                  ) : (
                    <Sanciones />
                  )
                }
              />
              {/* Redirección por defecto */}
              <Route path="*" element={<Navigate to="/catalogo" replace />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/" replace />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;
