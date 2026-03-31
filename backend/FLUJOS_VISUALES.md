╔══════════════════════════════════════════════════════════════╗
║   MOTOR DE SANCIONES - VISUALIZACIÓN DEL FLUJO COMPLETO      ║
║         Sistema de Gestión de Equipos (SGE)                  ║
╚══════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
🔐 FLUJO 1: AUTENTICACIÓN (Login)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                                        │
│                                                                         │
│  Usuario ingresa:                                                       │
│  Email: juan@example.com                                               │
│  Password: password123                                                  │
│                                                                         │
│  ▼                                                                       │
│  POST /api/auth/login                                                   │
│  Content-Type: application/json                                         │
│  {                                                                       │
│    "email": "juan@example.com",                                         │
│    "password": "password123"                                            │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP Request
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKEND (Node.js/Express) → authController.login()                      │
│                                                                         │
│  1. Desestructurar email & password                                     │
│  2. Buscar usuario en usuariosDB                                        │
│     ├─ No existe → Error 401                                           │
│     └─ Existe → Continuar                                              │
│                                                                         │
│  3. Validar contraseña con bcryptjs.compare()                           │
│     ├─ Incorrecta → Error 401                                          │
│     └─ Correcta → Continuar                                            │
│                                                                         │
│  4. Validar que usuario NO esté suspendido                              │
│     ├─ SUSPENDIDO → Error 403                                          │
│     └─ ACTIVO → Continuar                                              │
│                                                                         │
│  5. Generar token JWT                                                   │
│     token = jwt.sign({                                                 │
│       id: 1,                                                            │
│       email: "juan@example.com",                                        │
│       nombre: "Juan García",                                            │
│       rol: "ANALISTA",                                                  │
│       estado: "ACTIVO",                                                 │
│       strikes: 0                                                        │
│     }, JWT_SECRET, { expiresIn: "7d" })                                │
│                                                                         │
│  6. Retornar respuesta exitosa                                          │
└─────────────────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP Response
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                                        │
│                                                                         │
│  Recibe respuesta:                                                      │
│  {                                                                       │
│    "exito": true,                                                       │
│    "datos": {                                                           │
│      "token": "eyJhbGciOiJIUzI1NiIs...",                               │
│      "usuario": {                                                       │
│        "id": 1,                                                         │
│        "nombre": "Juan García",                                         │
│        "rol": "ANALISTA",                                               │
│        "estado": "ACTIVO",                                              │
│        "strikes": 0                                                     │
│      }                                                                   │
│    }                                                                     │
│  }                                                                       │
│                                                                         │
│  ✅ Guardar token en localStorage                                       │
│  ✅ Navegar a dashboard                                                 │
└─────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
⭐ FLUJO 2: MOTOR DE SANCIONES (Devolución de Equipo)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                                        │
│                                                                         │
│  Usuario presiona botón "Devolver Equipo"                               │
│  Ingresa:                                                               │
│  - id_prestamo: 102                                                     │
│  - fecha_entrega_real: 2024-03-20                                       │
│                                                                         │
│  POST /api/prestamos/devolver                                           │
│  Authorization: Bearer eyJhbGciOi...                                    │
│  {                                                                       │
│    "id_prestamo": 102,                                                  │
│    "fecha_entrega_real": "2024-03-20"                                   │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP Request + Token
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ MIDDLEWARE (authMiddleware.js)                                          │
│                                                                         │
│  verificarToken():                                                      │
│  ├─ Extraer token del header Authorization                             │
│  ├─ Verificar que existe → SI                                          │
│  ├─ Decodificar con JWT_SECRET                                         │
│  ├─ Verificar que no esté expirado → OK                               │
│  └─ req.usuario = { id, email, nombre, rol, estado, strikes }         │
│                                                                         │
│  verificarEstadoUsuario():                                              │
│  ├─ ¿Usuario está SUSPENDIDO?                                          │
│  ├─ SI → Error 403 "Usuario suspendido"                               │
│  └─ NO → Continuar hacia controlador                                   │
└─────────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ CONTROLLER: prestamosController.devolverEquipo()                        │
│                                                                         │
│  ======== FASE 1: VALIDACIONES ========                                 │
│                                                                         │
│  1. ¿Existen id_prestamo y fecha_entrega_real?                         │
│     ├─ NO → Error 400 "DATOS_INCOMPLETOS"                             │
│     └─ SÍ → Continuar                                                  │
│                                                                         │
│  2. Obtener préstamo de prestamosDB por id_prestamo                    │
│     ├─ ¿Existe?                                                        │
│     │  ├─ NO → Error 404 "PRESTAMO_NO_ENCONTRADO"                    │
│     │  └─ SÍ → Continuar                                              │
│     │                                                                  │
│     └─ prestamo = {                                                   │
│          id_prestamo: 102,                                             │
│          id_usuario: 2,                                                │
│          fecha_esperada: "2024-03-12",  ← KEY!                        │
│          fecha_entrega_real: null,                                     │
│          estado: "PENDIENTE"                                           │
│        }                                                               │
│                                                                         │
│  3. ¿Ya fue devuelto antes?                                             │
│     ├─ prestamo.estado === "DEVUELTO"?                                │
│     │  ├─ SÍ → Error 400 "PRESTAMO_YA_DEVUELTO"                      │
│     │  └─ NO → Continuar                                              │
│     │                                                                  │
│     └─ ¿El usuario existe?                                            │
│        ├─ NO → Error 404 "USUARIO_NO_ENCONTRADO"                    │
│        └─ SÍ → usuario = { id, nombre, rol, estado, strikes: 0 }     │
│                                                                         │
│  ======== FASE 2: CALCULAR RETRASO ========                             │
│                                                                         │
│  fecha_esperada = "2024-03-12"                                         │
│  fecha_entrega_real = "2024-03-20" (ENVIADA POR USUARIO)              │
│                                                                         │
│  diasRetraso = fecha_entrega_real - fecha_esperada                     │
│  diasRetraso = 8 días ✓ ← HAY RETRASO                                  │
│                                                                         │
│  ======== FASE 3: APLICAR SANCIÓN ========                              │
│                                                                         │
│  if (diasRetraso > 0) {    ← HAY RETRASO                               │
│    usuario.strikes += 1     ← ⭐ SUMAR +1                              │
│  }                                                                      │
│                                                                         │
│  Antes de la devolución:                                               │
│  ├─ usuario.strikes = 0                                                │
│                                                                         │
│  Después de la devolución:                                             │
│  ├─ usuario.strikes = 1   ✓ CAMBIO REGISTRADO                        │
│                                                                         │
│  ======== FASE 4: VERIFICAR REGLA DE ORO ========                       │
│                                                                         │
│  if (usuario.strikes >= 3) {  ← ¿LLEGA AL LÍMITE?                     │
│    usuario.estado = "SUSPENDIDO"  ← CAMBIO AUTOMÁTICO                 │
│  }                                                                      │
│                                                                         │
│  En este caso:                                                          │
│  usuario.strikes = 1 (no es >= 3)                                      │
│  → usuario.estado sigue siendo "ACTIVO"                                │
│                                                                         │
│  ======== FASE 5: MARCAR COMO DEVUELTO ========                         │
│                                                                         │
│  prestamo.estado = "DEVUELTO"                                          │
│  prestamo.fecha_entrega_real = new Date(fecha_entrega_real)            │
│                                                                         │
│  ======== FASE 6: CONSTRUIR RESPUESTA ========                          │
└─────────────────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP Response
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                                        │
│                                                                         │
│  Recibe respuesta:                                                      │
│  {                                                                       │
│    "exito": true,                                                       │
│    "mensaje": "Equipo devuelto con 8 día(s) de retraso.                │
│                Se ha registrado una sanción.",                          │
│    "datos": {                                                           │
│      "prestamo": {                                                      │
│        "id_prestamo": 102,                                              │
│        "id_equipo": "EQUIPO002",                                        │
│        "descripcion_equipo": "Monitor Samsung 27\"",                    │
│        "fecha_prestamo": "2024-03-05T00:00:00.000Z",                  │
│        "fecha_esperada": "2024-03-12T00:00:00.000Z",                  │
│        "fecha_entrega_real": "2024-03-20T00:00:00.000Z",              │
│        "estado": "DEVUELTO",                                            │
│        "diasRetraso": 8  ← KEY!                                        │
│      },                                                                  │
│      "usuario": {                                                       │
│        "id": 2,                                                         │
│        "nombre": "María López",                                         │
│        "email": "maria@example.com",                                    │
│        "rol": "SUPERVISOR",                                             │
│        "estado": "ACTIVO",                                              │
│        "strikes": 1,  ← CAMBIÓ DE 0 A 1                               │
│        "strikesAntesDelRetraso": 0,                                     │
│        "huboRetraso": true                                              │
│      },                                                                  │
│      "sanciones": {                                                     │
│        "tipo": "RETRASO_EN_DEVOLUCION",                                │
│        "diasRetraso": 8,                                                │
│        "strikeAplicado": 1,                                             │
│        "totalStrikes": 1,                                               │
│        "suspendido": false  ← Aún activo                               │
│      }                                                                   │
│    }                                                                     │
│  }                                                                       │
│                                                                         │
│  ✅ Mostrar alerta: "Se registró 1 sanción"                            │
│  ✅ Actualizar UI: Ahora tiene 1/3 strikes                             │
│  ✅ Usuario sigue siendo ACTIVO pero advertido                         │
└─────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
🚫 FLUJO 3: SUSPENSIÓN AUTOMÁTICA (3 STRIKES = BLOQUEADO)
═══════════════════════════════════════════════════════════════════════════════

ESCENARIO:
───────────
Usuario "Juan García" tiene:
├─ strikes: 2 (ya había recibido 2 sanciones antes)
├─ estado: "ACTIVO" (aún puede actuar)
└─ Ahora devuelve OTRO equipo con RETRASO

┌─────────────────────────────────────────────────────────────────────────┐
│ USUARIO DEVUELVE EQUIPO CON RETRASO                                     │
│                                                                         │
│ Usuario "Juan García":                                                  │
│ ├─ strikes ACTUAL: 2                                                    │
│ ├─ estado ACTUAL: "ACTIVO"                                              │
│ └─ Devuelve equipo CON retraso                                          │
│    → POST /api/prestamos/devolver                                       │
└─────────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ CONTROLLER: devolverEquipo()                                            │
│                                                                         │
│  PASO 1: Validaciones (OK)                                              │
│  PASO 2: diasRetraso = 5 (hay retraso)                                  │
│  PASO 3: usuario.strikes += 1                                           │
│          ├─ Antes: 2                                                    │
│          └─ Después: 3  ← ¡¡LLEGA AL LÍMITE!!                          │
│                                                                         │
│  PASO 4: ¿usuario.strikes >= 3?                                         │
│          ├─ Respuesta: SÍ!!!                                            │
│          └─ Ejecutar:                                                   │
│             usuario.estado = "SUSPENDIDO"  ← CAMBIO CRÍTICO             │
│             console.log("🚫 USUARIO SUSPENDIDO")                        │
│                                                                         │
│  PASO 5: Update estado en BD (userData)                                 │
│          ├─ usuario.id = 1                                              │
│          ├─ usuario.strikes = 3                                         │
│          └─ usuario.estado = "SUSPENDIDO"  ← PERSISTIDO                │
│                                                                         │
│  PASO 6: Construir respuesta ESPECIAL                                   │
│          mensaje += "⚠️ ALERTA: Tu cuenta ha sido SUSPENDIDA"           │
└─────────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND RECIBE RESPUESTA CRÍTICA                                       │
│                                                                         │
│  {                                                                       │
│    "exito": true,                                                       │
│    "mensaje": "...⚠️ ALERTA: Tu cuenta ha sido SUSPENDIDA              │
│                por exceso de retrasos (3 strikes).",                    │
│    "datos": {                                                           │
│      "usuario": {                                                       │
│        "id": 1,                                                         │
│        "nombre": "Juan García",                                         │
│        "strikes": 3,          ← EN EL LÍMITE                           │
│        "estado": "SUSPENDIDO"  ← BLOQUEADO                             │
│      },                                                                  │
│      "sanciones": {                                                     │
│        "suspendido": true  ← FLAG CRÍTICO                              │
│      }                                                                   │
│    }                                                                     │
│  }                                                                       │
│                                                                         │
│  ✅ Mostrar alerta roja: "¡Tu cuenta ha sido suspendida!"              │
│  ✅ Deshabilitar todas las acciones                                     │
│  ✅ Forzar logout del usuario                                           │
│  ✅ Mostrar mensaje: "Contacta al administrador"                       │
└─────────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKEND: ACCIONES FUTURAS DEL USUARIO SUSPENDIDO                        │
│                                                                         │
│  Si usuario intenta LOGIN:                                              │
│  ├─> verificarToken OK → Decodificar JWT                               │
│  ├─> Buscar usuario en BD                                              │
│  ├─> ¿usuario.estado === "SUSPENDIDO"?                                │
│  │   └─> SÍ → Error 403 "USUARIO_SUSPENDIDO"                          │
│  │       NO PUEDE INICIAR SESIÓN                                       │
│  │                                                                      │
│  Si usuario intenta DEVOLVER EQUIPO:                                    │
│  ├─> Middleware verificarEstadoUsuario()                                │
│  ├─> ¿usuario.estado === "SUSPENDIDO"?                                │
│  │   └─> SÍ → Error 403 "USUARIO_SUSPENDIDO"                          │
│  │       ACCESO DENEGADO INMEDIATAMENTE                               │
│  │                                                                      │
│  ✅ PROTECCIÓN: Usuario no puede hacer NADA                            │
│  🔒 REQUIERE: Admin desbloquee manualmente                             │
└─────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
📊 TABLA DE ESTADOS: EVOLUCIÓN DE UN USUARIO
═══════════════════════════════════════════════════════════════════════════════

USUARIO: Juan García (id: 1)

Evento                          │ Strikes    │ Estado      │ Acción Posible
────────────────────────────────┼────────────┼─────────────┼────────────────
Crea cuenta                     │ 0          │ ACTIVO      │ Puede usar todo
────────────────────────────────┼────────────┼─────────────┼────────────────
Devuelve equipo CON 5 días      │ 1          │ ACTIVO      │ Puede usar todo
retraso (SANCIÓN 1)             │            │             │ (Advertido)
────────────────────────────────┼────────────┼─────────────┼────────────────
Devuelve equipo CON 3 días      │ 2          │ ACTIVO      │ Puede usar todo
retraso (SANCIÓN 2)             │            │             │ (Muy advertido)
────────────────────────────────┼────────────┼─────────────┼────────────────
Devuelve equipo CON 2 días      │ 3          │ SUSPENDIDO  │ ❌ BLOQUEADO
retraso (SANCIÓN 3 - CRÍTICA)   │            │             │ NO PUEDE NADA
────────────────────────────────┼────────────┼─────────────┼────────────────
Admin lo reactiva               │ 3          │ ACTIVO      │ Puede usar todo
(Reset manual)                  │            │             │ (Condicional)

═══════════════════════════════════════════════════════════════════════════════
🔄 CICLO DE VIDA COMPLETO: DEVOLVER UN EQUIPO
═══════════════════════════════════════════════════════════════════════════════

1. FRONTEND envía request a /api/prestamos/devolver + token
   ↓
2. BACK.: Valida token con middleware (verificarToken)
   ↓
3. BACK.: Verifica que usuario NO esté suspendido (verificarEstadoUsuario)
   ↓
4. BACK.: Busca préstamo en BD (prestamosDB)
   ↓
5. BACK.: Busca usuario en BD (usuariosDB)
   ↓
6. BACK.: CALCULA diasRetraso = fecha_real - fecha_esperada
   ↓
7. BACK.: IF (diasRetraso > 0) {usuario.strikes += 1}  ← SANCIÓN APLICADA
   ↓
8. BACK.: IF (usuario.strikes >= 3) {usuario.estado = "SUSPENDIDO"} ← SUSPENSIÓN
   ↓
9. BACK.: prestamo.estado = "DEVUELTO"
   ↓
10. BACK.: Construye respuesta con detalles de sanciones
   ↓
11. FRONTEND recibe respuesta y actualiza UI
   ↓
12. SI usuario fue suspendido → Mostrar alerta crítica
   ↓
13. FIN: Usuario ve su nuevo saldo de strikes

═══════════════════════════════════════════════════════════════════════════════
✅ CHECKLIST DE FUNCIONAMIENTO
═══════════════════════════════════════════════════════════════════════════════

Cuando ejecutes npm run dev debes ver:

✓ Servidor inicia sin errores
✓ Escucha en http://localhost:3001
✓ Log muestra: "Backend iniciado correctamente"

Cuando hagas POST /api/auth/login:

✓ Retorna token JWT válido
✓ Retorna datos del usuario (sin password)
✓ Token contiene: id, email, nombre, rol, estado, strikes

Cuando hagas POST /api/prestamos/devolver:

✓ Sin retraso: strikes NO cambia, estado sigue ACTIVO
✓ Con retraso: strikes AUMENTA en 1
✓ 3 strikes: estado CAMBIA AUTOMÁTICO a SUSPENDIDO
✓ Usuario suspendido: No puede hacer más peticiones

═══════════════════════════════════════════════════════════════════════════════

🎯 CONCLUSIÓN:

El Motor de Sanciones funciona de forma COMPLETAMENTE AUTOMÁTICA:

1. No requiere intervención manual
2. Calcula retrasos automáticamente
3. Aplica sanciones al instante
4. Suspende al usuario al alcanzar límite
5. Previene que usuario suspendido haga nada más

TODO EL CÓDIGO ESTÁ EN:
├─ prestamosController.js → función devolverEquipo()
├─ authMiddleware.js → verificarEstadoUsuario()
└─ db.js → datos y lógica auxiliar

¡100% FUNCIONAL!
