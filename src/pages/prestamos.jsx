import { useState, useEffect } from "react";

export default function Prestamos() {

  const [prestamos, setPrestamos] = useState([]);
  const [producto, setProducto] = useState("");
  const [usuario, setUsuario] = useState("");
  const [cantidad, setCantidad] = useState("");

  // 🔥 CARGAR PRÉSTAMOS
  useEffect(() => {
    const guardados = localStorage.getItem("prestamos");

    if (guardados) {
      setPrestamos(JSON.parse(guardados));
    } else {
      const ejemplo = [
        { id: 1, producto: "Laptop", usuario: "Juan", cantidad: 1 }
      ];

      setPrestamos(ejemplo);
      localStorage.setItem("prestamos", JSON.stringify(ejemplo));
    }
  }, []);

  // 🔥 GUARDAR
  useEffect(() => {
    localStorage.setItem("prestamos", JSON.stringify(prestamos));
  }, [prestamos]);

  const agregarPrestamo = () => {
    if (!producto || !usuario || !cantidad) return;

    const inventario = JSON.parse(localStorage.getItem("inventario")) || [];

    const item = inventario.find(i => i.nombre === producto);

    if (!item) {
      alert("Producto no existe en inventario");
      return;
    }

    if (item.cantidad < Number(cantidad)) {
      alert("No hay suficiente stock");
      return;
    }

    // 🔥 RESTAR INVENTARIO
    
let cantidadRestante = 0;

const actualizado = inventario.map(i => {
  if (i.nombre === producto) {
    cantidadRestante = i.cantidad - Number(cantidad);

    return {
      ...i,
      cantidad: cantidadRestante
    };
  }
  return i;
});

    localStorage.setItem("inventario", JSON.stringify(actualizado));

    // 🔥 CREAR PRÉSTAMO
    const nuevo = {
  id: Date.now(),
  producto,
  usuario,
  cantidad: Number(cantidad),
  restante: cantidadRestante
};

    setPrestamos([...prestamos, nuevo]);

    setProducto("");
    setUsuario("");
    setCantidad("");
  };

  const eliminarPrestamo = (id) => {
    setPrestamos(prestamos.filter(p => p.id !== id));
  };

  return (
    <div className="flex">
      <main className="p-10 w-full bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">
          Préstamos
        </h1>

        {/* FORM */}
        <div className="bg-white p-6 rounded shadow mb-6">

          <input
            type="text"
            placeholder="Producto"
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            className="border p-2 mr-2"
          />

          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="border p-2 mr-2"
          />

          <input
            type="number"
            placeholder="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="border p-2 mr-2"
          />

          <button
            onClick={agregarPrestamo}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Guardar
          </button>
        </div>

        {/* LISTA */}
        {prestamos.map(p => (
          <div key={p.id} className="bg-white p-4 mb-2 rounded shadow flex justify-between">
            <div>
              <p className="font-bold">{p.producto}</p>
              <p>Usuario: {p.usuario}</p>
              <p>Cantidad: {p.cantidad}</p>
            </div>
            
            <p className="text-green-600">
             Quedan: {p.restante}
            </p>
            
            <button
              onClick={() => eliminarPrestamo(p.id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Eliminar
            </button>
          </div>
        ))}

      </main>
    </div>
  );
}
