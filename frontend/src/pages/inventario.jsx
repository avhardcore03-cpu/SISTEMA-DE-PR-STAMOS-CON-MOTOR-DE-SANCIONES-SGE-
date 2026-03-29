import React, { useState } from "react";
import { useApi } from "../hooks/useApi";
import { inventarioService } from "../services/apiService";

export default function Inventario() {
  const { datos: inventarios, cargando, setDatos } = useApi(inventarioService.getAll);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // 🔥 Ajustado a los nombres reales de db.js
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    estado: "Disponible",
    stock_total: "",
    descripcion: "",
    icono: "📦"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "stock_total" ? parseInt(value) || "" : value,
    }));
  };

  const handleCrear = async () => {
    if (!formData.nombre || !formData.stock_total) return;

    const nuevo = await inventarioService.create(formData);
    if (nuevo) {
      setDatos([...inventarios, nuevo]);
      handleCancelar();
    }
  };

  const handleActualizar = async () => {
    const actualizado = await inventarioService.update(editingId, formData);
    if (actualizado) {
      setDatos(inventarios.map((inv) => (inv.id === editingId ? actualizado : inv)));
      handleCancelar();
    }
  };

  const handleEditar = (item) => {
    setEditingId(item.id);
    setFormData(item);
    setShowForm(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este equipo?")) {
      const exito = await inventarioService.delete(id);
      if (exito) {
        setDatos(inventarios.filter((inv) => inv.id !== id));
      }
    }
  };

  const handleCancelar = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nombre: "", categoria: "", estado: "Disponible", stock_total: "", descripcion: "", icono: "📦" });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#002b45]">Gestión de Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">Total de equipos: {inventarios.length}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#008c72] hover:bg-[#00705b] text-white px-6 py-3 rounded-lg font-bold"
          >
            + Agregar Equipo
          </button>
        )}
      </div>

      {/* FORMULARIO */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
          <h3 className="text-lg font-bold mb-4">
            {editingId ? "Editar Equipo" : "Nuevo Equipo"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del equipo (Ej: Laptop Lenovo)"
              value={formData.nombre}
              onChange={handleInputChange}
              className="p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#008c72]"
            />
            <input
              type="text"
              name="categoria"
              placeholder="Categoría (Ej: Computadoras)"
              value={formData.categoria}
              onChange={handleInputChange}
              className="p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#008c72]"
            />
            <input
              type="number"
              name="stock_total"
              placeholder="Stock total"
              value={formData.stock_total}
              onChange={handleInputChange}
              className="p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#008c72]"
            />
            <select
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className="p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#008c72]"
            >
              <option value="Disponible">Disponible</option>
              <option value="Prestado">Prestado</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={editingId ? handleActualizar : handleCrear}
              className="bg-[#008c72] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#00705b]"
            >
              {editingId ? "Actualizar" : "Crear"}
            </button>
            <button
              onClick={handleCancelar}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* TABLA */}
      {cargando ? (
        <p className="text-center py-10 text-gray-400">Cargando inventario...</p>
      ) : inventarios.length === 0 ? (
        <p className="text-center py-10 text-gray-400">No hay equipos en el inventario</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Equipo</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Categoría</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Stock Total</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventarios.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-600">{item.id}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-800">
                    {item.icono} {item.nombre}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{item.categoria}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{item.stock_total}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.estado === "Disponible"
                          ? "bg-green-100 text-green-700"
                          : item.estado === "Prestado"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm space-x-2">
                    <button
                      onClick={() => handleEditar(item)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(item.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}