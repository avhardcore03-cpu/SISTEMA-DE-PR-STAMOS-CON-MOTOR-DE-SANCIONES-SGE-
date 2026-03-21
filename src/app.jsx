import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/sidebar";
import Login from "./pages/Login";
import Inventario from "./pages/inventario";
import Prestamos from "./pages/prestamos";
import Sanciones from "./pages/sanciones";

function App() {
  const location = useLocation();

  return (
    <div className="flex">
      {location.pathname !== "/" && <Sidebar />}
      <main className={`flex-1 ${location.pathname !== "/" ? "pl-64" : ""}`}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/prestamos" element={<Prestamos />} />
          <Route path="/sanciones" element={<Sanciones />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
