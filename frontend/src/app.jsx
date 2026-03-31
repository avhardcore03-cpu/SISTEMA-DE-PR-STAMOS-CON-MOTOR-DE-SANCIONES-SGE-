import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";

// Importación de Páginas
import Login from "./pages/Login";
import Inventario from "./pages/inventario";
import Prestamos from "./pages/prestamos";
import Sanciones from "./pages/sanciones";
import Catalogo from "./pages/catalogo"; 
import CatalogoEstudiante from "./pages/CatalogoEstudiante"; 
import GestionReservas from "./pages/GestionReservas"; 

function App() {
  const location = useLocation();
  const [rol, setRol] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 1. Intentamos sacar el usuario del localStorage
    const user = JSON.parse(localStorage.getItem("user")); 
    const token = localStorage.getItem("authToken");
    
    if (user && user.role) {
      setRol(user.role); 
    } else if (token === "token-de-emergencia-12345") {
      // 2. Si solo tenemos nuestro token de prueba, asignamos ADMIN por defecto
      setRol("ADMIN"); 
    } else {
      setRol(null);
    }
    setCargando(false);
  }, [location]);

  // Lógica de visualización de roles
  const esAdmin = rol === "ADMIN";
  const esEstudiante = rol === "ESTUDIANTE";
  
  // No mostrar el Sidebar en Login o si no hay sesión
  const mostrarSidebar = location.pathname !== "/" && rol !== null;
  const margenIzquierdo = mostrarSidebar ? "pl-64" : "";

  if (cargando) return <div className="flex justify-center items-center h-screen">Cargando sistema...</div>;

  return (
    <div className="flex">
      {/* El Sidebar recibe el rol para mostrar Gestión de Inventario y Préstamos */}
      {mostrarSidebar && <Sidebar rol={rol} />}

      <main className={`flex-1 ${margenIzquierdo} min-h-screen bg-gray-50`}>
        <Routes>
          {/* RUTA PÚBLICA */}
          <Route path="/" element={<Login />} />

          {/* RUTAS PROTEGIDAS */}
          {rol ? (
            <>
              <Route 
                path="/catalogo" 
                element={esEstudiante ? <CatalogoEstudiante /> : <Catalogo />} 
              />

              {/* SECCIONES FUSIONADAS (ADMIN) */}
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/prestamos" element={<Prestamos />} />
              
              {/* SECCIONES COMPLEMENTARIAS */}
              <Route path="/sanciones" element={<Sanciones />} />
              <Route path="/reservas" element={<GestionReservas />} />

              {/* Redirección si entras a una ruta que no existe pero estás logueado */}
              <Route path="*" element={<Navigate to="/catalogo" replace />} />
            </>
          ) : (
            // Si no estás logueado, cualquier ruta te manda al Login
            <Route path="*" element={<Navigate to="/" replace />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;