# 🗺️ ARQUITECTURA DEL SISTEMA SGE

## 📐 Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (React + Vite)                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  /login ──┬──→ /catalogo (Estudiante)                  │
│    ▲      │                                              │
│    │      ├──→ /prestamos (Admin) ────────────┐         │
│    │      │    - Form crear préstamo           │         │
│    │      │    - Tabla vencidos                │         │
│    │      │    - Botón Strike                  │         │
│    │      │                        ┌─────────┐ │         │
│    │      └──→ /sanciones (Admin)  │Dashboard│ │         │
│    │           - Contadores        │Real-time│ │         │
│    │           - Tabla equipo+fecha└─────────┘ │         │
│    │                                            │         │
│    └────────────────────────────────────────────┘         │
│                                                          │
└──────────────────────────┬───────────────────────────────┘
                           │ HTTPS/JWT
                           ▼
┌──────────────────────────────────────────────────────────┐
│             BACKEND (Express.js + Node.js)               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │             RUTAS (Routes)                       │   │
│ │                                                   │   │
│ │ GET  /api/prestamos ..................... [Auth] │   │
│ │ POST /api/prestamos/crear ... [Auth + Admin]    │   │
│ │ PUT  /api/prestamos/:id/strike [Auth + Admin]   │   │
│ │ GET  /api/sanciones/dashboard ...... [Public]   │   │
│ │ GET  /api/usuarios/:id ................. [Auth]  │   │
│ │                                                   │   │
│ └──────────────────────────────────────────────────┘   │
│            ▲                              ▲              │
│            │                              │              │
│ ┌──────────┴──────────────┐   ┌──────────┴────────┐    │
│ │   Controllers           │   │  Auth Middleware  │    │
│ ├─────────────────────────┤   ├───────────────────┤    │
│ │                         │   │                   │    │
│ │ prestamosController:    │   │ verificarToken    │    │
│ │ • obtenerTodos          │   │ verificarRol      │    │
│ │ • crear                 │   │                   │    │
│ │ • asignarStrike         │   └───────────────────┘    │
│ │                         │                             │
│ │ sancionesController:    │                             │
│ │ • obtenerDashboard      │                             │
│ │                         │                             │
│ └─────────────────────────┘                             │
│            ▲                                             │
│            │                                             │
│ ┌──────────┴────────────────────────────────────────┐  │
│ │         DATABASE (db.js - In-Memory)              │  │
│ ├───────────────────────────────────────────────────┤  │
│ │                                                   │  │
│ │ usuariosDB: [7 usuarios]◄─────────┐             │  │
│ │  └─ tipo_documento (CC/TI)        │             │  │
│ │  └─ identificacion (10 dígitos)   │             │  │
│ │  └─ strikes                       │             │  │
│ │  └─ estado                        │             │  │
│ │                                   │             │  │
│ │ prestamosDB: [5+ préstamos]────────┤cross-ref   │  │
│ │  └─ nombre_usuario                │             │  │
│ │  └─ email_usuario                 │             │  │
│ │  └─ fecha_devolucion (calc)       │             │  │
│ │  └─ fecha_sancion                 │             │  │
│ │  └─ estado                        │             │  │
│ │  └─ equipoRetenido ────────────────┘             │  │
│ │                                                   │  │
│ │ equiposDB: [10 equipos]                          │  │
│ │  └─ stock_total                                   │  │
│ │  └─ stock_disponible (calc)                       │  │
│ │                                                   │  │
│ │ FUNCIONES CLAVE:                                 │  │
│ │ • calcularFechaConDiasHabiles()                  │  │
│ │ • obtenerPrestamosVencidos()                     │  │
│ │ • obtenerDashboardSanciones()                    │  │
│ │ • asignarStrike()                                │  │
│ │                                                   │  │
│ └───────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo: Crear Préstamo

```
ADMIN entra /prestamos
          │
          ▼
┌─────────────────────────────────┐
│  Form: Estudiante, Equipo, Fecha│
└────────────┬────────────────────┘
             │
             ▼
      Click "Crear"
             │
             ▼
┌────────────────────────────────────────┐
│  POST /api/prestamos/crear (JWT Token)│
└────────────┬─────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│  Controllers/prestamosController      │
│  • Valida usuario existe               │
│  • Valida equipo existe                │
│  • Valida stock_disponible > 0         │
└────────────┬─────────────────────────┘
             │
             ▼
  ✅ Todas las validaciones pasan
             │
             ▼
┌────────────────────────────────────────┐
│  calcularFechaConDiasHabiles()        │
│  Entrada: fecha_prestamo + 15         │
│  Procesa: Itera días, salta fines de  │
│           semana                       │
│  Salida: fecha_devolucion             │
└────────────┬─────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│  Crear nuevo objeto prestamo           │
│  {id, usuario, equipo, fecha_prestamo, │
│   fecha_devolucion (✅ CALCULADA),     │
│   estado: PENDIENTE, ...}              │
└────────────┬─────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│ Guardar en prestamosDB                 │
└────────────┬─────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│ Response: {exito, mensaje, datos}      │
│ Mensaje: "✅ Préstamo creado. Dev: ..." │
└────────────┬─────────────────────────┘
             │
             ▼
Frontend: Tabla se actualiza
          Botón Strike = GRIS (no vencido)
          
Servidor: [ALERTA CORREO] loguea
          (Si está vencido)
```

---

## 🎯 Flujo: Asignar Strike

```
ADMIN ve préstamo vencido (fondo ROJO)
          │
          ▼
    Click "Asignar Strike"
    (Botón NARANJA habilitado)
          │
          ▼
┌──────────────────────────────────────┐
│ PUT /api/prestamos/:id/strike        │
│ + Authorization: JWT                 │
└──────────┬──────────────────────────┘
           │
           ▼
Controllers/prestamosController
• Valida: préstamo existe
• Valida: hoy > fecha_devolucion
  (IMPORTANT: Normalizar ambas a 00:00)
• Valida: estado === PENDIENTE
           │
           ▼
    ✅ Todas validaciones pasan
           │
           ▼
┌──────────────────────────────────────┐
│ db.js: asignarStrike(id_usuario)    │
│                                       │
│ usuario.strikes++                    │
│ IF strikes >= 3:                     │
│   usuario.estado = "SUSPENDIDO"      │
│ ENDIF                                │
└──────────┬──────────────────────────┘
           │
           ▼
Actualizar prestamo.fecha_sancion
Actualizar prestamo.dias_retraso
           │
           ▼
┌──────────────────────────────────────┐
│ Response: {exito, datos:             │
│ {strikes_actuales, estado, ...}}     │
│ Mensaje: "⚠️ Strike asignado...      │
│           Strikes: 2/3"              │
└──────────┬──────────────────────────┘
           │
           ▼
Frontend:
• Tabla se actualiza
• Botón deshabilitado (si strikes=3)
• Llamar GET /api/sanciones/dashboard
           │
           ▼
Dashboard /sanciones:
• Total strikes aumenta en 1
• Suspendidos aumenta (si strikes=3)
• Tabla se refresca
```

---

## 📊 Flujo: Dashboard Sanciones (Real-Time)

```
ADMIN entra /sanciones
          │
          ▼
┌──────────────────────────────┐
│ useEffect []                 │
│ • Fetch GET /api/sanciones/  │
│   dashboard                  │
│ • Fetch GET /api/sanciones   │
│   (paralelo)                 │
└──────┬──────────────────────┘
       │
       ─────────────────────┬────────────────────
       │                    │
       ▼                    ▼
┌─────────────────────┐  ┌─────────────────┐
│ Dashboard Data:     │  │ Sancionados     │
│ {usuarios_sanc, ... │  │ Detail Array    │
│  sancionados_detail}│  │                 │
└─────────┬───────────┘  └────────┬────────┘
          │                       │
          ▼                       ▼
Render 3 Contadores        Render Tabla
• Usuarios Sancionados      6 columnas:
• Suspendidos               ID, Nombre,
• Total Strikes             Correo,
                           **Equipo**,
Color: #008c72              **Fecha
Actualiza dinámicamente      Sanción**,
                             Strikes,
                            Acciones
           │
           ▼
Click "Asignar Strike" → PUT /api/prestamos/:id/strike
           │
           ▼
Backend actualiza prestamo.fecha_sancion
           │
           ▼
Frontend refetch GET /api/sanciones/dashboard
           │
           ▼
CONTADORES SE ACTUALIZAN EN TIEMPO REAL
```

---

## 🔐 Seguridad: RBAC Matrix

```
┌──────────────┬──────────┬────────┬──────────┐
│ Endpoint     │ ADMIN    │ USER   │ Public   │
├──────────────┼──────────┼────────┼──────────┤
│ GET /        │ ✅       │ ✅     │ ❌       │
│ /prestamos   │ ✅       │ ❌     │ ❌       │
│ /sanciones   │ ✅       │ ❌     │ ❌       │
│ /catalogo    │ ✅       │ ✅     │ ❌       │
│ GET /api/    │          │        │          │
│  prestamos   │ ✅       │ ✅     │ ❌       │
│ POST /api/   │          │        │          │
│  prestamos   │ ✅       │ ❌     │ ❌       │
│ PUT /api/    │          │        │          │
│  prestamos   │ ✅       │ ❌     │ ❌       │
│ GET /api/    │          │        │          │
│  sanciones   │ ✅       │ ✅     │ ✅       │
│  /dashboard  │          │        │          │
└──────────────┴──────────┴────────┴──────────┘

✅ = Permiso
❌ = Sin permiso
```

---

## 📦 Estructura de Datos

### usuariosDB
```javascript
{
  id: 5,
  nombre: "Luis González",
  email: "luis@example.com",
  password_hash: "...",
  rol: "ESTUDIANTE",
  tipo_documento: "CC",           // NEW
  identificacion: "1001234567",   // NEW
  estado: "ACTIVO",
  strikes: 0
}
```

### prestamosDB
```javascript
{
  id: 101,
  id_usuario: 3,
  nombre_usuario: "Carlos Ramírez",             // NEW
  email_usuario: "carlos@example.com",          // NEW
  tipo_documento: "CC",                         // NEW
  identificacion: "1001234567",                 // NEW
  id_equipo: 1,
  nombre_equipo: "Laptop Lenovo ThinkPad",
  fecha_prestamo: "2024-03-15",
  fecha_devolucion: "2024-04-12",               // CALCULATED
  fecha_entrega_real: null,
  estado: "PENDIENTE",
  fecha_sancion: "2024-03-27T10:30:00Z",        // NEW
  dias_retraso: 12                              // NEW
}
```

### equiposDB
```javascript
{
  id: 1,
  nombre: "Laptop Lenovo ThinkPad",
  descripcion: "Laptop para desarrollo",
  stock_total: 2,
  stock_disponible: 1,    // Calculado: stock_total - count(PENDIENTE)
  estado: "Disponible"
}
```

---

## 🧮 Algoritmos Clave

### 1. calcularFechaConDiasHabiles()
```
Input:  fecha_inicio, dias_habiles = 15
Output: fecha_resultado

WHILE dias_contados < dias_habiles:
  fecha.setDate(fecha.getDate() + 1)
  
  IF fecha.getDay() !== 0 AND !== 6:  // No es sábado/domingo
    dias_contados++
  
RETURN fecha
```

**Ejemplo:**
```
Input:  27 Marzo (Viernes), 15 días
Output: 26 Abril (Viernes)
Skip:   30-31 Mar, 6-7 Apr, 13-14 Apr, 20-21 Apr (fines de semana)
```

### 2. obtenerDashboardSanciones()
```
usuarios_sancionados = COUNT(usuariosDB WHERE strikes > 0)
suspendidos = COUNT(usuariosDB WHERE estado = "SUSPENDIDO")
total_strikes = SUM(usuariosDB.strikes)

FOR EACH usuario WITH strikes > 0:
  equipo_retenido = buscar en prestamosDB
  fecha_sancion = prestamo.fecha_sancion
  
RETURN {usuarios_sancionados, suspendidos, total_strikes, sancionados_detail}
```

---

## 📈 Flujo de Datos

```
┌─────┐
│User │────────────┐
└─────┘            │
                   ▼
         ┌──────────────────┐
         │ verificarToken   │
         │ verificarRol     │
         └────────┬─────────┘
                  │
                  ▼
        Controller Function
                  │
    ┌─────────────┴────────────────┐
    │                              │
    ▼                              ▼
 GET/POST/PUT            Validaciones
    │                      (usuario, equipo,
    ▼                       stock)
 db.js                        │
Operación              ┌──────┴──────┐
    │                  │             │
    ├──Lectura        ✅ OK         ❌ Error
    ├──Cálculo         │             │
    └──Escritura       ▼             ▼
                    Actualizar   Return 400
                    en BD        + Mensaje
                    │
                    ▼
                  Response
                  {exito, datos,
                   mensaje}
                    │
                    ▼
                   User
```

---

## ⏳ Timeline de Vencimiento

```
DAY 1 (Préstamo creado)
┌──────────────────────────────────────┐
│ Cliente obtiene equipo                │
│ fecha_prestamo = HOY                  │
│ fecha_devolucion = HOY + 15 días lab  │
│ estado = PENDIENTE                    │
│ Botón Strike = GRIS                   │
└──────────────────────────────────────┘

DAY 16 (Próximo día hábil después del límite)
┌──────────────────────────────────────┐
│ Préstamo está VENCIDO                 │
│ hoy > fecha_devolucion                │
│ [ALERTA CORREO] loguea en servidor    │
│ Botón Strike = NARANJA (habilitado)   │
│ Row fondo = ROJO                      │
└──────────────────────────────────────┘

ADMIN ASIGNA STRIKE
┌──────────────────────────────────────┐
│ usuario.strikes++                     │
│ prestamo.fecha_sancion = NOW          │
│ prestamo.dias_retraso = calc          │
│ Si strikes = 3:                       │
│   usuario.estado = "SUSPENDIDO"       │
│ Dashboard actualiza en tiempo real    │
└──────────────────────────────────────┘
```

---

**📐 Este diagrama cubre toda la arquitectura del sistema SGE integrado.**
