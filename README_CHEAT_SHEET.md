# ⚡ CHEAT SHEET - REFERENCIA RÁPIDA

Consulta rápida sin fluff.

---

## 🔑 CREDENCIALES TESTING

```
SUSPENDIDOS (Login rechazado ❌)
lina.campos@example.com        / password123
diego.morales@example.com      / password123

ACTATIVO (Login permitido ✅)
paula.guzman@example.com       / password123  (2 strikes)
roberto.soto@example.com       / password123  (1 strike)
andrea.lopez@example.com       / password123  (0 strikes)
```

---

## 📡 ENDPOINTS API

### Catálogo (Equipos)
```
GET /api/catalogo
→ Retorna: equipos con stock_disponible, stock_prestado

GET /api/catalogo/:id
→ Retorna: un equipo específico
```

### Sanciones
```
GET /api/sanciones
→ Retorna: usuarios con equipoRetenido

PUT /api/sanciones/perdonar/:id
→ Resetea: strikes=0, estado=ACTIVO
```

### Usuarios (⭐ NUEVO)
```
GET /api/usuarios/:id
→ Retorna: estado, strikes, rol, email
```

---

## 📊 ESTRUCTURA DATOS

### Usuario
```javascript
{
  id: 4,
  nombre: "Lina Campos",
  estado: "SUSPENDIDO",    // ACTIVO o SUSPENDIDO
  strikes: 3,               // 0-3
  email: "...",
  rol: "ESTUDIANTE"
}
```

### Equipo
```javascript
{
  id: 1,
  nombre: "Laptop Lenovo",
  stock_total: 2,
  stock_disponible: 1,      // ⭐ Calculado
  stock_prestado: 1,        // ⭐ Calculado
  estado: "Disponible",    // Basado en disponibilidad
  categoria: "Computadoras"
}
```

### Préstamo
```javascript
{
  id_prestamo: 101,
  id_usuario: 4,
  id_equipo: 1,
  nombre_equipo: "Laptop Lenovo",  // ⭐ Para sanciones
  fecha_prestamo: Date,
  fecha_esperada: Date,
  estado: "PENDIENTE"  // O "DEVUELTO"
}
```

### Sanción (API Response)
```javascript
{
  id: 4,
  nombre: "Lina Campos",
  strikes: 3,
  estado: "SUSPENDIDO",
  equipoRetenido: "Laptop Lenovo"  // ⭐ Nuevo
}
```

---

## 🎯 LÓGICA CORE

### Cálculo de disponibilidad
```javascript
stock_disponible = stock_total - (count where estado='PENDIENTE')
```

### Bloqueo de estudiante
```
IF estado === "SUSPENDIDO"
  THEN mostrar banner + deshabilitar botones "Solicitar"
  ELSE mostrar normal
```

### Obtener equipo retenido
```javascript
prestamosDB.find(p => p.id_usuario === usuarioId && p.estado === 'PENDIENTE')
            .nombre_equipo
```

---

## 🛠️ ARCHIVOS MODIFICADOS

```
✅ db.js (datos + 1 función)
✅ catalogoController.js (cálculo stock)
✅ sancionesController.js (equipo retenido)
✅ authController.js (nueva función)
✅ authRoutes.js (nueva ruta)
✅ catalogo.jsx (banner + bloqueo)
✅ sanciones.jsx (columna equipo)
```

---

## 🧪 TEST RÁPIDOS

### Verificar Base Datos
```javascript
// Console DevTools
fetch('http://localhost:5000/api/catalogo').then(r=>r.json()).then(d=>console.log(d))
fetch('http://localhost:5000/api/sanciones').then(r=>r.json()).then(d=>console.log(d))
fetch('http://localhost:5000/api/usuarios/4').then(r=>r.json()).then(d=>console.log(d))
```

### Test Login
```
Email: paula.guzman@example.com
Pass: password123
Esperado: ✅ Acceso, sin banner rojo
```

### Test Sanciones
```
Admin → /sanciones
Esperado: 4 usuarios con "Equipo Retenido" visible
Click "Perdonar" Lina
Esperado: ✅ Desaparece de tabla
```

---

## 🚨 Si algo falla

| Problema | Solución |
|----------|----------|
| Red Error | Backend no corre, verifica puerto 5000 |
| 404 /usuarios/:id | Verifica authRoutes.js tiene ruta |
| equipoRetenido es null | Verifica prestamosDB tiene nombre_equipo |
| Botón no se deshabilita | Verifica que fetch a /usuarios/:id funciona |
| Login ACTIVO pero ver banner | Recarga página o limpia localStorage |

---

## 📈 MÉTRICAS SISTEMA

- **8 usuarios total** (3 admin + 5 estudiantes)
- **10 equipos** disponibles
- **4 préstamos PENDIENTE** (vencidos)
- **3 usuarios SUSPENDIDOS** (uno más activo)
- **5 endpoints** modificados/nuevos
- **7 archivos** actualizados

---

## 💾 DATOS PERSISTENCIA

**Actualmente:** En memoria (se pierden al reiniciar servidor)
**Guardar a JSON:** Usa `fs.writeFileSync('data/db.json', ...)`
**SQL:** Próximo nivel (cuando necesites

---

## 📚 DOCUMENTOS DISPONIBLES

| Documento | Para qué |
|-----------|----------|
| INTEGRACION_COMPLETADA.md | Resumen técnico completo |
| GUIA_TESTING.md | Pruebas paso a paso |
| BLOQUES_CODIGO_REFERENCIA.md | Código copiable |
| README_INTEGRACION.md | Visión general |
| **README_CHEAT_SHEET.md** | **Esto** (referencia rápida) |

---

**¡Listo para usar! 🚀**
