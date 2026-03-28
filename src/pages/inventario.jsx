import { useEffect, useState } from "react";

export default function Inventario() {

  const [items, setItems] = useState([]);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");

  // 🔥 CARGAR INVENTARIO
  useEffect(() => {
    const guardados = localStorage.getItem("inventario");

    if (guardados) {
      setItems(JSON.parse(guardados));
    } else {
      const data = [
        { id: 1, nombre: "Laptop", cantidad: 5 },
        { id: 2, nombre: "Mouse", cantidad: 10 }
      ];

      setItems(data);
      localStorage.setItem("inventario", JSON.stringify(data));
    }
  }, []);

  // 🔥 GUARDAR
  useEffect(() => {
    localStorage.setItem("inventario", JSON.stringify(items));
  }, [items]);

  const agregarProducto = () => {
    if (!nombre || !cantidad) return;

    const nuevo = {
      id: Date.now(),
      nombre,
      cantidad: Number(cantidad)
    };

    setItems([...items, nuevo]);
    setNombre("");
    setCantidad("");
  };

  const eliminarProducto = (id) => {
    setItems(items.filter(item => item.id !== id));
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