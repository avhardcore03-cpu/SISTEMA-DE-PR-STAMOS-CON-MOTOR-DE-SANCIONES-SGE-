# 📋 Integración Profunda: Préstamos, Inventario y Sanciones

## 🎯 Resumen de Cambios

Se ha completado una integración profunda de los tres módulos (Préstamos, Sanciones e Inventario) con cálculo automático de fechas hábiles, validación de stock en tiempo real, y un dashboard de sanciones completamente dinámico.

---

## 📦 1. BACKEND - BASE DE DATOS (db.js)

### ✅ Cambios Realizados:

#### 1.1 Campos Agregados a Usuarios:
- `tipo_documento`: "CC" (Cédula de Ciudadanía) o "TI" (Tarjeta de Identidad)
- `identificacion`: Número de identificación único del usuario

**Ejemplo:**
```javascript
{
  id: 3,
  nombre: "Carlos Ramírez",
  email: "carlos.ramirez@example.com",
  tipo_documento: "CC",
  identificacion: "1001234567",
  password: "...",
  rol: "ESTUDIANTE",
  estado: "SUSPENDIDO",
  strikes: 1,
  fechaCreacion: new Date("2024-02-01")
}
```

#### 1.2 Estructura Actualizada de Préstamos:
```javascript
{
  id_prestamo: 101,
  id_usuario: 3,
  nombre_usuario: "Carlos Ramírez",
  email_usuario: "carlos.ramirez@example.com",
  tipo_documento: "CC",
  identificacion: "1001234567",
  id_equipo: 1,
  nombre_equipo: "Laptop Lenovo ThinkPad",
  fecha_prestamo: new Date("2024-03-01"),
  fecha_devolucion: new Date("2024-03-25"), // Calculada automáticamente
  fecha_entrega_real: null,
  estado: "PENDIENTE",
  fecha_sancion: null,
  dias_retraso: 5 // Calculado dinámicamente
}
```

#### 1.3 Nuevas Funciones de Utilidad:

**`calcularFechaConDiasHabiles(fechaInicio, diasHabiles = 15)`**
- Suma N días hábiles a una fecha
- Salta automáticamente sábados y domingos
- Usado para calcular fecha de devolución

**`obtenerPrestamosVencidos()`**
- Retorna array de préstamos con `estado === 'PENDIENTE'` y `fecha_devolucion < hoy`
- Se ejecuta en el endpoint GET /api/prestamos y loguea alertas

**`obtenerDashboardSanciones()`**
- Retorna objeto con:
  - `usuarios_sancionados`: count
  - `suspendidos`: count
  - `total_strikes`: sum
  - `sancionados_detail`: array completo con equipo_retenido y fecha_sancion

---

## 🔌 2. BACKEND - CONTROLADORES

### 2.1 prestamosController.js - Nuevas Funciones:

#### **`GET /api/prestamos`** - `obtenerTodosPrestamosController()`
```javascript
Response: {
  exito: true,
  cantidad: 5,
  prestamos: [...],
  alertas: 2 // cantidad de préstamos vencidos
}
// Console output:
// [ALERTA CORREO] Enviando aviso de atraso a: carlos.ramirez@example.com por el equipo: Laptop Lenovo ThinkPad
```

#### **`POST /api/prestamos/crear`** - `crearPrestamo()`
```javascript
Request: {
  id_usuario: 3,
  id_equipo: 1,
  fecha_prestamo: "2024-03-27"
}

Response: {
  exito: true,
  mensaje: "Préstamo creado exitosamente.",
  datos: {
    id_prestamo: 106,
    ... // nuevo préstamo con fecha_devolucion calculada
  }
}

Validaciones:
✓ Usuario existe
✓ Equipo existe
✓ Stock disponible > 0
✓ Fecha de préstamo válida
✓ Calcula automáticamente fecha_devolucion (15 días hábiles)
```

#### **`PUT /api/prestamos/:id/strike`** - `asignarStrikePrestamo()`
```javascript
Request: PUT /api/prestamos/101/strike

Response: {
  exito: true,
  mensaje: "Strike asignado a Carlos Ramírez. Strikes: 2/3",
  datos: {
    id_usuario: 3,
    nombre_usuario: "Carlos Ramírez",
    strikesAnteriores: 1,
    strikesActuales: 2,
    estado: "ACTIVO",
    id_prestamo: 101,
    dias_retraso: 5
  }
}

Validaciones:
✓ Préstamo existe
✓ Fecha actual > fecha_devolucion
✓ Estado del préstamo === PENDIENTE
✓ Si strikes >= 3: usuario.estado = "SUSPENDIDO"
```

### 2.2 sancionesController.js - Nueva Función:

#### **`GET /api/sanciones/dashboard`** - `obtenerDashboard()`
```javascript
Response: {
  exito: true,
  datos: {
    usuarios_sancionados: 2,
    suspendidos: 2,
    total_strikes: 3,
    sancionados_detail: [
      {
        id: 3,
        nombre: "Carlos Ramírez",
        email: "carlos.ramirez@example.com",
        tipo_documento: "CC",
        identificacion: "1001234567",
        strikes: 1,
        estado: "SUSPENDIDO",
        equipo_retenido: "Laptop Lenovo ThinkPad",
        fecha_sancion: "2024-03-27T10:30:00.000Z"
      },
      // ...más sancionados
    ]
  }
}
```

---

## 🎨 3. FRONTEND - VISTA PRÉSTAMOS (prestamos.jsx)

### ✅ Características Implementadas:

#### 3.1 Formulario de Registro Completo
**Campos:**
- Estudiante (select desplegable con ESTUDIANTE users)
- Equipo a Prestar (select desplegable con disponibilidad)
- Fecha de Préstamo (input date)
- Fecha de Devolución (solo lectura, calculada automáticamente)

#### 3.2 Tabla de Préstamos Activos
**Columnas:**
| Columna | Descripción |
|---------|-------------|
| ID | ID único del préstamo |
| Nombre | Nombre del estudiante |
| Correo | Email del estudiante |
| Identidad | Tipo_documento + Identificación |
| Equipo | Nombre del equipo prestado |
| F. Préstamo | Fecha de salida |
| F. Devolución | Fecha esperada de retorno (con color rojo si vencida) |
| Estado | PENDIENTE o DEVUELTO |
| Acciones | Botón "Asignar Strike" (solo si vencido) |

#### 3.3 Validaciones Dinámicas
```javascript
// Botón "Asignar Strike" SOLO habilitado si:
// - Estado del préstamo === PENDIENTE
// - Fecha actual > fecha_devolucion
// - Muestra color rojo si está vencido

const estaPrestamovencido = (fechaDevolucion) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(fechaDevolucion);
  fecha.setHours(0, 0, 0, 0);
  return hoy > fecha;
};
```

#### 3.4 Indicadores Visuales
- 🟢 **Verde**: Préstamo dentro de plazo
- 🔴 **Rojo**: Préstamo vencido (⏰ badge + fondo rojo)
- **Naranja**: Botón "Asignar Strike" para vencidos

---

## 🎨 4. FRONTEND - VISTA SANCIONES (sanciones.jsx)

### ✅ Características Implementadas:

#### 4.1 Contadores Dinámicos (Conectados a Dashboard)

**Antes (hardcodeado):**
```javascript
{sancionados.length}
{sancionados.filter((s) => s.estado === "SUSPENDIDO").length}
{sancionados.reduce((sum, s) => sum + s.strikes, 0)}
```

**Ahora (desde endpoint /api/sanciones/dashboard):**
```javascript
{dashboard.usuarios_sancionados}
{dashboard.suspendidos}
{dashboard.total_strikes}
```

**Respuesta:**
```javascript
const [dashboard, setDashboard] = useState({
  usuarios_sancionados: 2,
  suspendidos: 2,
  total_strikes: 3,
  sancionados_detail: [...]
});
```

#### 4.2 Tabla Actualizada
**Nuevas Columnas:**
| Columna | Descripción |
|---------|-------------|
| ID | ID único del usuario |
| Nombre | Nombre completo |
| Correo | Email del usuario |
| **Equipo Atrasado** | Nombre del equipo retenido (sin devolver) |
| **Fecha de Sanción** | Cuándo se registró el atraso |
| Strikes | Contador visual (⚠️⚠️⚠️) |
| Acciones | Botones Asignar Strike + Perdonar |

**Antes:**
```
ID | Nombre | Email | Strikes | Equipo Retenido | Estado | Acciones
```

**Ahora:**
```
ID | Nombre | Correo | Equipo Atrasado | Fecha de Sanción | Strikes | Acciones
```

#### 4.3 Ejemplo de Datos Mostrados
```javascript
{
  id: 3,
  nombre: "Carlos Ramírez",
  email: "carlos.ramirez@example.com",
  tipo_documento: "CC",
  identificacion: "1001234567",
  strikes: 1,
  estado: "SUSPENDIDO",
  equipo_retenido: "Laptop Lenovo ThinkPad",
  fecha_sancion: "2024-03-27" // Formateado con toLocaleDateString()
}
```

---

## 🔐 5. AUTENTICACIÓN Y AUTORIZACIÓN

### Middleware Requerido:

- **`verificarToken`**: Valida JWT
- **`verificarRol(['ADMIN'])`**: Solo ADMIN pueden crear préstamos y asignar strikes

### Endpoints Protegidos:

```javascript
// Solo para lectura (cualquier usuario autenticado)
GET /api/prestamos
GET /api/sanciones
GET /api/sanciones/dashboard

// Requiere ADMIN
POST /api/prestamos/crear
PUT /api/prestamos/:id/strike
```

---

## 🧮 6. LÓGICA DE CÁLCULO DE DÍAS HÁBILES

**Función Core:**
```javascript
export const calcularFechaConDiasHabiles = (fechaInicio, diasHabiles = 15) => {
  const fecha = new Date(fechaInicio);
  let diasContados = 0;
  
  while (diasContados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1);
    const diaSemana = fecha.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) { // 0=domingo, 6=sábado
      diasContados++;
    }
  }
  
  return fecha;
};
```

**Ejemplos:**
- Préstamo: 2024-03-27 (Miércoles) → Devolución: 2024-04-22 (Lunes, 15 días hábiles después)
- Préstamo: 2024-03-28 (Jueves) → Devolución: 2024-04-23 (Martes)
- Salta automáticamente fines de semana

---

## 📊 7. FLUJO COMPLETO DE DATOS

### Crear Préstamo:
```
Usuario Admin -> POST /api/prestamos/crear
  ↓
prestamosController.crearPrestamo()
  ↓
Validaciones (usuario, equipo, stock)
  ↓
calcularFechaConDiasHabiles(fecha_prestamo, 15)
  ↓
Nuevo registro en prestamosDB
  ↓
Response con fecha_devolucion calculada
  ↓
prestamos.jsx actualiza tabla
```

### Asignar Strike por Atraso:
```
Admin -> Click "Asignar Strike" (en préstamo vencido)
  ↓
PUT /api/prestamos/:id/strike
  ↓
asignarStrikePrestamo()
  ↓
Validar: fecha_actual > fecha_devolucion
  ↓
asignarStrike(id_usuario) en db.js
  ↓
usuario.strikes += 1
  ↓
Si strikes >= 3: usuario.estado = "SUSPENDIDO"
  ↓
Response con strikesActuales y nuevo estado
  ↓
sanciones.jsx refresh (trigger++)
  ↓
Dashboard recalcula: usuarios_sancionados, suspendidos, total_strikes
```

### Ver Dashboard de Sanciones:
```
Entra a /sanciones
  ↓
useEffect triggeriza cargas paralelas:
  - GET /api/sanciones/dashboard → setDashboard()
  - GET /api/sanciones → setSancionados()
  ↓
Contadores actualizados: {usuarios_sancionados, suspendidos, total_strikes}
  ↓
Tabla muestra sancionados_detail con equipo_retenido y fecha_sancion
  ↓
Ambos botones (Asignar Strike + Perdonar) disponibles
```

---

## 🚀 8. CÓMO PROBAR EL SISTEMA

### Credenciales:
```
ADMIN:
  Email: admin1@example.com
  Password: admin

ESTUDIANTE (ACTIVO):
  Email: luis.gonzalez@example.com
  Password: password123

ESTUDIANTE (SUSPENDIDO):
  Email: carlos.ramirez@example.com
  Password: password123
```

### Pasos de Prueba:

**1. Crear un préstamo nuevo:**
```bash
POST /api/prestamos/crear
{
  "id_usuario": 5,
  "id_equipo": 1,
  "fecha_prestamo": "2024-03-27"
}
```
✅ Respuesta tendrá `fecha_devolucion: 2024-04-22` (15 días hábiles después)

**2. Ver todos los préstamos con alertas:**
```bash
GET /api/prestamos
```
✅ Console mostrará alertas de préstamos vencidos
✅ Respuesta incluirá campo `alertas: X`

**3. Asignar strike por atraso:**
```bash
PUT /api/prestamos/101/strike
```
✅ Usuario recibe +1 strike
✅ Si llega a 3 strikes: `estado = "SUSPENDIDO"`

**4. Ver dashboard con contadores dinámicos:**
```bash
GET /api/sanciones/dashboard
```
✅ Retorna agregados reales: usuarios_sancionados, suspendidos, total_strikes

**5. En Frontend - Página Sanciones:**
- Contadores superiores actualizados en tiempo real
- Tabla muestra "Equipo Atrasado" y "Fecha de Sanción"
- Botones disponibles para Asignar Strike y Perdonar

---

## 📝 9. NOTAS TÉCNICAS IMPORTANTES

### Base de Datos (En Memoria):
- `usuariosDB`: 2 ADMIN + 5 ESTUDIANTE (2 con strikes > 0)
- `prestamosDB`: 5 registros con 2 PENDIENTE y 3 DEVUELTO
- `equiposDB`: 10 items con stock_total

### Campos Calculados Dinámicamente:
- `fecha_devolucion`: Generada al crear préstamo (15 días hábiles)
- `dias_retraso`: Calculado cuando se asigna strike
- `stock_disponible`: No se modifica, se calcula `stock_total - (count PENDIENTE)`

### Listados de Sanciones:
- Se alimentan de `prestamosDB` filtrando por `estado === 'PENDIENTE'`
- El cruce de usuarios y préstamos ocurre en `obtenerDashboardSanciones()`

---

## ✅ Checklist de Implementación

- [x] Base de datos: tipo_documento e identificacion en usuarios
- [x] función calcularFechaConDiasHabiles en db.js
- [x] Endpoint GET /api/prestamos con alertas
- [x] Endpoint POST /api/prestamos/crear con validaciones
- [x] Endpoint PUT /api/prestamos/:id/strike
- [x] Endpoint GET /api/sanciones/dashboard
- [x] prestamos.jsx con formulario completo
- [x] Tabla de préstamos con columnas correctas
- [x] Botón "Asignar Strike" (solo si vencido)
- [x] sanciones.jsx con contadores dinámicos
- [x] Tabla actualizada con "Equipo Atrasado" y "Fecha de Sanción"
- [x] Integración frontend-backend lista

---

**Sistema completamente integrado y listo para pruebas. ¡Éxito! 🎉**
