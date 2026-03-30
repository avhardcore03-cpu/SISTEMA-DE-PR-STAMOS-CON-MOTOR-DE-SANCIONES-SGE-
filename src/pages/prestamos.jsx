import { useState, useEffect } from "react";

const Prestamos = () => {
  const [inventario, setInventario] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [productoId, setProductoId] = useState("");
  const [usuario, setUsuario] = useState("");
  const [cantidad, setCantidad] = useState("");

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      const resInv = await fetch("http://localhost:3001/inventario");
      const resPre = await fetch("http://localhost:3001/prestamos");
      setInventario(await resInv.json());
      setPrestamos(await resPre.json());
    } catch (e) {
      console.error("Error al cargar datos", e);
    }
  };

  const manejarPrestar = async () => {
    if (!productoId || !usuario || !cantidad) return alert("Llena todos los campos");

    try {
      const res = await fetch("http://localhost:3001/prestamos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productoId: Number(productoId),
          usuario,
          cantidad: Number(cantidad)
        }),
      });

      if (res.ok) {
        setProductoId(""); setUsuario(""); setCantidad("");
        cargarTodo(); // Recarga inventario y lista de préstamos
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (e) {
      alert("Error de conexión");
    }
  };

  const manejarDevolver = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/prestamos/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        alert("Devolución procesada correctamente");
        cargarTodo(); // Actualiza la pantalla
      } else {
        const err = await res.json();
        alert(err.error);
        cargarTodo(); // Refresca por si la lista estaba desactualizada
      }
    } catch (e) {
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6">Préstamos</h1>

      <div className="bg-white p-6 rounded shadow border mb-6 flex gap-4">
        <select 
          className="border p-2 rounded w-full"
          value={productoId} 
          onChange={e => setProductoId(e.target.value)}
        >
          <option value="">Seleccione un equipo...</option>
          {inventario.map(item => (
            <option key={item.id} value={item.id}>{item.nombre} (Stock: {item.cantidad})</option>
          ))}
        </select>
        <input 
          className="border p-2 rounded w-full"
          placeholder="Usuario" 
          value={usuario} 
          onChange={e => setUsuario(e.target.value)} 
        />
        <input 
          className="border p-2 rounded w-full"
          type="number" 
          placeholder="Cant." 
          value={cantidad} 
          onChange={e => setCantidad(e.target.value)} 
        />
        <button onClick={manejarPrestar} className="bg-green-500 text-white px-6 py-2 rounded font-bold">Prestar</button>
      </div>

      <div className="grid gap-4">
        {prestamos.map(p => (
          <div key={p.id} className="bg-white p-4 rounded shadow border flex justify-between items-center">
            <div>
              <p className="font-bold">{p.productoNombre}</p>
              <p className="text-sm">Usuario: {p.usuario} | Cantidad: {p.cantidad}</p>
            </div>
            <button onClick={() => manejarDevolver(p.id)} className="bg-red-500 text-white px-4 py-2 rounded font-bold">
              Devolver / Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Prestamos;