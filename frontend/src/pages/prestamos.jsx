import { useState, useEffect } from "react";

const Prestamos = ({ userStatus }) => {
  // Recibimos el estado del usuario desde App.jsx
  const [inventario, setInventario] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [productoId, setProductoId] = useState("");
  const [idUsuario, setIdUsuario] = useState("");
  const [fechaPactada, setFechaPactada] = useState("");

  const API_INV = "http://localhost:3001/api/inventario";
  const API_PRE = "http://localhost:3001/api/prestamos";
  const API_USU = "http://localhost:3001/api/usuarios";
  const estaSuspendido = (userStatus || "").toUpperCase() === "SUSPENDIDO";

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      const resInv = await fetch(API_INV);
      const resPre = await fetch(API_PRE);
      const resUsu = await fetch(API_USU);
      if (resInv.ok) setInventario(await resInv.json());
      if (resPre.ok) setPrestamos(await resPre.json());
      if (resUsu.ok) {
        const data = await resUsu.json();
        setUsuarios(data?.datos || []);
      }
    } catch (e) {
      console.error("Error al cargar datos:", e);
    }
  };

  const manejarDevolver = async (id) => {
    if (
      !window.confirm(
        "¿Confirmas la devolución? El sistema verificará si hay retraso.",
      )
    )
      return;

    const hoy = new Date().toISOString().split("T")[0];

    try {
      const res = await fetch(`${API_PRE}/devolver/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha_real_entrega: hoy }),
      });

      if (res.ok) {
        const resultado = await res.json();
        alert(resultado.mensaje);
        // Notificar a Sanciones que recargue datos
        localStorage.setItem("sancionesRefresh", Date.now().toString());
        cargarTodo();
      }
    } catch (e) {
      alert("Error al procesar la devolución");
    }
  };

  const manejarPrestar = async () => {
    // 1. BLOQUEO: Si el usuario está suspendido, no dejamos ni intentar el fetch
    if (estaSuspendido) {
      return alert(
        "⛔ ACCESO DENEGADO: El usuario tiene 3 strikes y está suspendido.",
      );
    }

    if (!productoId || !idUsuario) {
      return alert("Selecciona usuario y equipo.");
    }

    const usuarioSeleccionado = usuarios.find(
      (u) => u.id === Number(idUsuario),
    );

    if (!usuarioSeleccionado) {
      return alert("Selecciona un usuario válido.");
    }

    try {
      const res = await fetch(API_PRE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productoId: Number(productoId),
          id_usuario: Number(idUsuario),
          usuario: usuarioSeleccionado.email,
          fecha_pactada: fechaPactada || undefined,
        }),
      });

      if (res.ok) {
        setProductoId("");
        setIdUsuario("");
        setFechaPactada("");
        cargarTodo();
        alert("¡Préstamo registrado con éxito!");
      } else {
        const errorData = await res.json();
        alert(errorData.mensaje || "Error al realizar el préstamo.");
      }
    } catch (e) {
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="p-10 bg-[#f8fafc] min-h-screen font-sans text-slate-800">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Gestión de Préstamos
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Administra salidas y entradas con control de strikes.
        </p>
      </div>

      {/* FORMULARIO MEJORADO */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Equipo
          </label>
          <select
            className="w-full border-slate-200 border-2 p-3 rounded-xl bg-slate-50 outline-none focus:border-emerald-500"
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
          >
            <option value="">Selecciona...</option>
            {inventario.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre} ({item.cantidad})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Usuario
          </label>
          <select
            className="w-full border-slate-200 border-2 p-3 rounded-xl bg-slate-50 outline-none focus:border-emerald-500"
            value={idUsuario}
            onChange={(e) => setIdUsuario(e.target.value)}
          >
            <option value="">Selecciona...</option>
            {usuarios
              .filter((u) => u.rol === "ESTUDIANTE")
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} - {u.estado}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Fecha de devolución
          </label>
          <input
            type="date"
            className="w-full border-slate-200 border-2 p-3 rounded-xl bg-slate-50 outline-none focus:border-emerald-500"
            value={fechaPactada}
            onChange={(e) => setFechaPactada(e.target.value)}
          />
          <p className="text-xs text-slate-500 mt-1">
            Si se deja vacío, se asignan 7 días automáticamente.
          </p>
        </div>

        <button
          onClick={manejarPrestar}
          disabled={estaSuspendido}
          className={`${estaSuspendido ? "bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"} text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100`}
        >
          {estaSuspendido ? "BLOQUEADO" : "Prestar"}
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-slate-800">
        Préstamos Activos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prestamos.map((p) => (
          <div
            key={p.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden"
          >
            {/* Etiqueta de fecha límite visible */}
            <div className="absolute top-0 right-0 bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500 uppercase">
              Límite: {p.fecha_pactada}
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1 mt-2">
              {p.productoNombre}
            </h3>
            <p className="text-slate-600 mb-4 italic">Usuario: {p.usuario}</p>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
              <span className="text-sm font-bold text-emerald-600">
                Cant: {p.cantidad}
              </span>
              <button
                onClick={() => manejarDevolver(p.id)}
                className="text-red-500 hover:text-red-700 font-bold text-sm"
              >
                Registrar Devolución
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Prestamos;
