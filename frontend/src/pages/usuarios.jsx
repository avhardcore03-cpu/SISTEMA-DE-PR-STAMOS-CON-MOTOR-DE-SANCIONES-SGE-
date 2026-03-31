import { useEffect, useState } from "react";

const API_USUARIOS = "http://localhost:3001/api/usuarios";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    rol: "ESTUDIANTE",
  });
  const [cargando, setCargando] = useState(false);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const res = await fetch(API_USUARIOS);
      const data = await res.json();
      if (res.ok && data.exito) {
        setUsuarios(data.datos || []);
      }
    } catch (error) {
      console.error("Error cargando usuarios", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const crearUsuario = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.email) {
      alert("Nombre y correo son obligatorios.");
      return;
    }

    try {
      const res = await fetch(API_USUARIOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.mensaje || "No se pudo crear el usuario.");
        return;
      }

      setForm({ nombre: "", email: "", rol: "ESTUDIANTE" });
      cargarUsuarios();
      alert("Usuario creado correctamente.");
    } catch (error) {
      alert("Error de conexión al crear usuario.");
    }
  };

  const eliminarUsuario = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar a ${nombre}?`)) return;

    try {
      const res = await fetch(`${API_USUARIOS}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.mensaje || "No se pudo eliminar el usuario.");
        return;
      }
      cargarUsuarios();
      alert("Usuario eliminado correctamente.");
    } catch (error) {
      alert("Error de conexión al eliminar usuario.");
    }
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen text-slate-800">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Gestión de Usuarios
        </h1>
        <p className="text-slate-500 mt-1">
          Crear y eliminar usuarios para gestionar préstamos.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-bold mb-4">Agregar usuario</h2>
        <form
          onSubmit={crearUsuario}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
              Nombre
            </label>
            <input
              className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Laura Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
              Correo
            </label>
            <input
              type="email"
              className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="usuario@correo.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
              Rol
            </label>
            <select
              className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
            >
              <option value="ESTUDIANTE">ESTUDIANTE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <button className="p-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all">
            Crear usuario
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-700">Usuarios registrados</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Correo</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Strikes</th>
              <th className="p-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cargando ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-slate-400">
                  Cargando usuarios...
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-slate-400">
                  No hay usuarios.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="p-4 text-slate-500">#{u.id}</td>
                  <td className="p-4 font-semibold text-slate-800">
                    {u.nombre}
                  </td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4 text-slate-600">{u.rol}</td>
                  <td className="p-4 text-slate-600">{u.estado}</td>
                  <td className="p-4 text-slate-600">{u.strikes}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => eliminarUsuario(u.id, u.nombre)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded-lg font-semibold hover:bg-red-200"
                      disabled={u.rol === "ADMIN"}
                      title={
                        u.rol === "ADMIN"
                          ? "No se puede eliminar un admin"
                          : "Eliminar usuario"
                      }
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
