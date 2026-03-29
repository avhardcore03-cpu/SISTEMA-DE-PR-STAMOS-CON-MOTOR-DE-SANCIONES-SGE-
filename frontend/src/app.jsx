import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";

// Importación de Páginas
import Login from "./pages/Login";
import Inventario from "./pages/inventario";
import Prestamos from "./pages/prestamos";
import Sanciones from "./pages/sanciones";
import Catalogo from "./pages/catalogo"; // Este es el de Admin
import CatalogoEstudiante from "./pages/CatalogoEstudiante"; // Este es el nuevo
import GestionReservas from "./pages/GestionReservas"; // La que creamos para el Admin

function App() {
  const location = useLocation();
  const [rol, setRol] = useState(null);

  // 1. Extraer el rol del token cada vez que cambia la ruta
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        // Decodificamos el payload del JWT
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRol(payload.rol); // 'ADMIN' o 'ESTUDIANTE'
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        setRol(null);
      }
    } else {
      setRol(null);
    }
  }, [location]);

  // 2. Lógica de visualización
  const esEstudiante = rol === "ESTUDIANTE";
  const esAdmin = rol === "ADMIN";
  
  // No mostrar sidebar en el Login
  const mostrarSidebar = location.pathname !== "/" && rol !== null;
  const margenIzquierdo = mostrarSidebar ? "pl-64" : "";

  return (
    <div className="flex">
      {/* El Sidebar debe recibir el rol para saber qué botones mostrar */}
      {mostrarSidebar && <Sidebar rol={rol} />}

      <main className={`flex-1 ${margenIzquierdo} min-h-screen bg-gray-50`}>
        <Routes>
          {/* Ruta Pública */}
          <Route path="/" element={<Login />} />

          {/* 🟢 RUTA DINÁMICA: Cambia el componente según el Rol */}
          <Route 
            path="/catalogo" 
            element={
              esEstudiante ? <CatalogoEstudiante /> : <Catalogo />
            } 
          />

          {/* 🔴 RUTAS SOLO PARA ADMIN */}
          {esAdmin && (
            <>
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/prestamos" element={<Prestamos />} />
              <Route path="/sanciones" element={<Sanciones />} />
              <Route path="/reservas" element={<GestionReservas />} />
            </>
          )}

          {/* Redirección por defecto si la ruta no existe */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;