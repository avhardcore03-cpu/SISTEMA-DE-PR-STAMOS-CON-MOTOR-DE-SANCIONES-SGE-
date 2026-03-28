import { useEffect, useState } from "react";

export default function Inventario() {

  const [items, setItems] = useState([]);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");

  // 🔥 FUNCIÓN PARA CARGAR INVENTARIO
  const cargarInventario = () => {
    fetch("http://localhost:3001/inventario")
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error("Error:", err));
  };

  // 🔥 CARGAR AL INICIO
  useEffect(() => {
    cargarInventario();
  }, []);

  const agregarProducto = async () => {
    if (!nombre || !cantidad) return;

    const nuevo = {
      id: Date.now(),
      nombre,
      cantidad: Number(cantidad)
    };

    // 🔥 ENVIAR AL BACKEND
    await fetch("http://localhost:3001/inventario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(nuevo)
    });

    // 🔥 RECARGAR DESDE BACKEND
    cargarInventario();

    setNombre("");
    setCantidad("");
  };

  const eliminarProducto = async (id) => {
    const nuevos = items.filter(item => item.id !== id);

    // 🔥 ACTUALIZAR BACKEND
    await fetch("http://localhost:3001/inventario", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(nuevos)
    });

    // 🔥 RECARGAR
    cargarInventario();
  };

  return (
    <div className="flex">
      <main className="p-10 w-full bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">
          Inventario
        </h1>

        {/* FORM */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
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
            onClick={agregarProducto}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Agregar
          </button>
        </div>

        {/* LISTA */}
        {items.map(item => (
          <div key={item.id} className="bg-white p-4 mb-2 rounded shadow flex justify-between">
            <div>
              <p className="font-bold">{item.nombre}</p>
              <p>Cantidad: {item.cantidad}</p>

              {item.cantidad < 3 && (
                <p className="text-red-500">⚠ Stock bajo</p>
              )}
            </div>

            <button
              onClick={() => eliminarProducto(item.id)}
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