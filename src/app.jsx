import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Inventario from "./pages/inventario";
import Prestamos from "./pages/prestamos";
import Sanciones from "./pages/sanciones";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/inventario" element={<Inventario />} />
      <Route path="/prestamos" element={<Prestamos />} />
      <Route path="/sanciones" element={<Sanciones />} />
    </Routes>
  );
}

export default App;
