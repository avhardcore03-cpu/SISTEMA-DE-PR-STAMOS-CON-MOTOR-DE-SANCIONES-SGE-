# 📘 Guía de uso - Sistema de CRUD

## ¿Qué creé?

Centralicé todas las operaciones de base de datos en 2 archivos:

### 1. **`src/services/apiService.js`** - Servicio API
Contiene las funciones para conectarse al json-server (CRUD):
- `catalogoService.getAll()` - Obtiene todos los catálogos
- `catalogoService.create(data)` - Crea uno nuevo
- `catalogoService.update(id, data)` - Actualiza uno existente
- `catalogoService.delete(id)` - Elimina uno

Lo mismo para: `inventarioService`, `prestamosService`, `sancionesService`

### 2. **`src/hooks/useApi.js`** - Hook personalizado
Simplifica el manejo de estado dentro de componentes. Se usa en: `catalogo.jsx`, `inventario.jsx`, `prestamos.jsx`, `sanciones.jsx`

---

## 🚀 Cómo usar en tus componentes

### **Paso 1: Importar**
```javascript
import { useApi } from "../hooks/useApi";
import { catalogoService } from "../services/apiService";
```

### **Paso 2: Obtener datos (READ)**
```javascript
const { datos: equipos, cargando } = useApi(catalogoService.getAll);

// datos = array con los datos
// cargando = boolean (true mientras carga)
```

### **Paso 3: Crear (CREATE)**
```javascript
const nuevoEquipo = {
  nombre: "Laptop Nueva",
  tipo: "Computadoras",
  estado: "Disponible",
  icono: "💻"
};

const resultado = await catalogoService.create(nuevoEquipo);
// resultado = objeto creado o null si falló
```

### **Paso 4: Actualizar (UPDATE)**
```javascript
const equipoActualizado = { ...equipo, estado: "No disponible" };
const resultado = await catalogoService.update(equipo.id, equipoActualizado);
```

### **Paso 5: Eliminar (DELETE)**
```javascript
const exito = await catalogoService.delete(equipo.id);
// exito = true o false
```

---

## 📋 Ejemplo Completo - Tabla con CRUD

```javascript
import React, { useState } from "react";
import { useApi } from "../hooks/useApi";
import { inventarioService } from "../services/apiService";

const MiComponente = () => {
  const { datos, cargando, setDatos } = useApi(inventarioService.getAll);
  const [nombre, setNombre] = useState("");

  const crear = async () => {
    const nuevo = await inventarioService.create({ item: nombre });
    if (nuevo) setDatos([...datos, nuevo]);
  };

  const actualizar = async (id) => {
    const actualizado = await inventarioService.update(id, { stock_disponible: 5 });
    if (actualizado) {
      setDatos(datos.map(d => d.id === id ? actualizado : d));
    }
  };

  const eliminar = async (id) => {
    const exito = await inventarioService.delete(id);
    if (exito) setDatos(datos.filter(d => d.id !== id));
  };

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <input onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" />
      <button onClick={crear}>Crear</button>

      <table>
        <tbody>
          {datos.map(item => (
            <tr key={item.id}>
              <td>{item.item}</td>
              <td>
                <button onClick={() => actualizar(item.id)}>Editar</button>
                <button onClick={() => eliminar(item.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MiComponente;
```

---

## 🔄 Servicios Disponibles

```javascript
// CATÁLOGO
import { catalogoService } from "../services/apiService";
catalogoService.getAll()
catalogoService.create(data)
catalogoService.update(id, data)
catalogoService.delete(id)

// INVENTARIO
import { inventarioService } from "../services/apiService";
// ... mismo patrón

// PRÉSTAMOS
import { prestamosService } from "../services/apiService";
// ... mismo patrón

// SANCIONES
import { sancionesService } from "../services/apiService";
// ... mismo patrón
```

---

## ⚙️ Asegúrate que json-server esté corriendo

```bash
cd data
npx json-server --watch db.json --port 3001
```

Verifica en: `http://localhost:3001/catalogo`

---

¿Necesitas ayuda implementando esto en otro componente?
