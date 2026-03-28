import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/sidebar";
import Login from "./pages/login";
import Inventario from "./pages/inventario";
import Prestamos from "./pages/prestamos";
import Sanciones from "./pages/sanciones";
import Catalogo from "./pages/catalogo";

function App() {
  const location = useLocation();

  return (
    <div className="flex">
      {location.pathname !== "/" && <Sidebar />}
      <main className={`flex-1 ${location.pathname !== "/" ? "pl-64" : ""}`}>
        <Routes>
          {/* <Route path="/" element={<Catalogo />} /> */}
          <Route path="/" element={<Login />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/prestamos" element={<Prestamos />} />
          <Route path="/sanciones" element={<Sanciones />} />
          <Route path="/catalogo" element={<Catalogo />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
