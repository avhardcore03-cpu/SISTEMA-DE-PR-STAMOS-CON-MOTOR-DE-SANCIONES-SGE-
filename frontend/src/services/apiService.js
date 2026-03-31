// API Service - Centraliza todas las operaciones CRUD
const API_URL = "http://localhost:3001";

// OPERACIONES GENERALES (GET, POST, PUT, DELETE)
export const apiService = {
  // Obtener todos los datos de una tabla
  async getAll(endpoint) {
    try {
      const response = await fetch(`${API_URL}/${endpoint}`);
      if (!response.ok) throw new Error(`Error en ${endpoint}`);
      return await response.json();
    } catch (error) {
      console.error(`Error al obtener ${endpoint}:`, error);
      return [];
    }
  },

  // Obtener un dato específico por ID
  async getById(endpoint, id) {
    try {
      const response = await fetch(`${API_URL}/${endpoint}/${id}`);
      if (!response.ok) throw new Error(`Error al obtener ${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error al obtener ${endpoint}/${id}:`, error);
      return null;
    }
  },

  // Crear un nuevo dato
  async create(endpoint, data) {
    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Error al crear en ${endpoint}`);
      return await response.json();
    } catch (error) {
      console.error(`Error al crear en ${endpoint}:`, error);
      return null;
    }
  },

  // Actualizar un dato
  async update(endpoint, id, data) {
    try {
      const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Error al actualizar ${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error al actualizar ${endpoint}/${id}:`, error);
      return null;
    }
  },

  // Eliminar un dato
  async delete(endpoint, id) {
    try {
      const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Error al eliminar ${id}`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar ${endpoint}/${id}:`, error);
      return false;
    }
  },
};

// OPERACIONES ESPECÍFICAS POR TABLA

// CATÁLOGO
export const catalogoService = {
  getAll: () => apiService.getAll("api/inventario"),
};

// INVENTARIO
export const inventarioService = {
  getAll: () => apiService.getAll("inventario"),
  getById: (id) => apiService.getById("inventario", id),
  create: (data) => apiService.create("inventario", data),
  update: (id, data) => apiService.update("inventario", id, data),
  delete: (id) => apiService.delete("inventario", id),
};

// PRÉSTAMOS
export const prestamosService = {
  getAll: () => apiService.getAll("prestamos"),
  getById: (id) => apiService.getById("prestamos", id),
  create: (data) => apiService.create("prestamos", data),
  update: (id, data) => apiService.update("prestamos", id, data),
  delete: (id) => apiService.delete("prestamos", id),
};

// SANCIONES
export const sancionesService = {
  getAll: () => apiService.getAll("sanciones"),
  getById: (id) => apiService.getById("sanciones", id),
  create: (data) => apiService.create("sanciones", data),
  update: (id, data) => apiService.update("sanciones", id, data),
  delete: (id) => apiService.delete("sanciones", id),
};
