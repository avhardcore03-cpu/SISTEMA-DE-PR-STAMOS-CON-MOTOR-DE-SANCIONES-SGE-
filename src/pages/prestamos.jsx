import { useState, useEffect } from "react";

export default function Prestamos() {

  const [prestamos, setPrestamos] = useState([]);
  const [producto, setProducto] = useState("");
  const [usuario, setUsuario] = useState("");
  const [cantidad, setCantidad] = useState("");

  // 🔥 CARGAR DESDE BACKEND
  useEffect(() => {
    fetch("http://localhost:3001/prestamos")
      .then(res => res.json())
      .then(data => setPrestamos(data))
      .catch(err => console.error("Error:", err));
  }, []);

  const agregarPrestamo = () => {
    if (!producto || !usuario || !cantidad) return;

    const nuevo = {
      id: Date.now(),
      producto,
      usuario,
      cantidad: Number(cantidad)
    };

    // 🔥 ACTUALIZA FRONT
    setPrestamos([...prestamos, nuevo]);

    // 🔥 ENVÍA AL BACKEND
    fetch("http://localhost:3001/prestamos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(nuevo)
    });

    setProducto("");
    setUsuario("");
    setCantidad("");
  };

  const eliminarPrestamo = (id) => {
    const nuevos = prestamos.filter(p => p.id !== id);
    setPrestamos(nuevos);
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