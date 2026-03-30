/**
 * ARQUITECTURA DEL BACKEND - Sistema de Gestión de Equipos (SGE)
 * Guía completa para entender y explicar el sistema ante el profesor
 */

// ============================================================
// 🏗️  ARQUITECTURA EN CAPAS
// ============================================================

/*
┌─────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                │
│              http://localhost:5173 (React)           │
└────────────────────┬────────────────────────────────┘
                     │ HTTP Requests
                     ▼
┌─────────────────────────────────────────────────────┐
│              EXPRESS SERVER (Puerto 5000)            │
│    Node.js + Express + JWT + Motor de Sanciones     │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │            ROUTES (Enrutamiento)             │   │
│  │  - /api/auth (login, perfil)                 │   │
│  │  - /api/prestamos (devoluciones, sanciones)  │   │
│  └──────────┬──────────────────────────────────┘   │
│             │                                        │
│  ┌──────────▼──────────────────────────────────┐   │
│  │        MIDDLEWARE (Validación)               │   │
│  │  - verificarToken (JWT)                      │   │
│  │  - verificarRol (ADMIN, SUPERVISOR, etc)     │   │
│  │  - verificarEstadoUsuario (ACTIVO/SUSPENDIDO)│  │
│  └──────────┬──────────────────────────────────┘   │
│             │                                        │
│  ┌──────────▼──────────────────────────────────┐   │
│  │      CONTROLLERS (Lógica de Negocio)        │   │
│  │  - authController (login, perfil)           │   │
│  │  - prestamosController (devolver equipo)    │   │
│  │    └─> MOTOR DE SANCIONES aquí! ⭐         │   │
│  └──────────┬──────────────────────────────────┘   │
│             │                                        │
│  ┌──────────▼──────────────────────────────────┐   │
│  │      DATABASE (Datos en Memoria)            │   │
│  │  - usuariosDB (array de objetos)            │   │
│  │  - prestamosDB (array de objetos)           │   │
│  │                                              │   │
│  │  NOTA: Preparado para migración a SQL       │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
└─────────────────────────────────────────────────────┘
*/

// ============================================================
// 🔐 FLUJO DE AUTENTICACIÓN CON JWT
// ============================================================

/*
1. CLIENTE REALIZA LOGIN
   ┌─────────────────────────────────┐
   │ POST /api/auth/login            │
   │ {                               │
   │   "email": "juan@example.com"   │
   │   "password": "password123"     │
   │ }                               │
   └───────────────├─────────────────┘
                   |
2. SERVIDOR VALIDA CREDENCIALES
   ├─> ¿Email existe en BD? SI -> Continuar
   │                          NO -> Error 401
   │
   ├─> ¿Password es correcto? SI -> Continuar
   │                          NO -> Error 401
   │
   └─> ¿Usuario está SUSPENDIDO? SI -> Error 403
                                NO -> Continuar

3. SERVIDOR GENERA TOKEN JWT
   Token = {
     id: 1,
     email: "juan@example.com",
     nombre: "Juan García",
     rol: "ANALISTA",
     estado: "ACTIVO",
     strikes: 0,
     exp: 1711584000  // Expira en 7 días
   }
   Token firmado con JWT_SECRET

4. CLIENTE RECIBE RESPUESTA
   {
     "exito": true,
     "datos": {
       "token": "eyJhbGciOi...",
       "usuario": { ... }
     }
   }

5. CLIENTE GUARDA TOKEN EN LOCALSTORAGE
   localStorage.setItem("token", "eyJhbGciOi...")

6. CLIENTE INCLUYE TOKEN EN FUTUROS REQUESTS
   GET /api/auth/perfil
   Authorization: Bearer eyJhbGciOi...

7. SERVIDOR VERIFICA TOKEN EN MIDDLEWARE
   ├─> ¿Token existe? SI -> Continuar
   │                  NO -> Error 401
   │
   ├─> ¿Token es válido? SI -> Decodificar
   │                      NO -> Error 401
   │
   └─> ¿Token está expirado? SI -> Error 401
                              NO -> Acceso concedido

8. MIDDLEWARE AGREGA USUARIO A REQUEST
   req.usuario = {
     id: 1,
     email: "juan@example.com",
     ...
   }

9. CONTROLADOR PROCESA LA SOLICITUD
   El controlador ya tiene acceso a req.usuario
   Puede usarlo en su lógica
*/

// ============================================================
// ⭐ FLUJO DEL MOTOR DE SANCIONES (CORAZÓN DEL SISTEMA)
// ============================================================

/*
ENDPOINT: POST /api/prestamos/devolver

ENTRADA:
{
  "id_prestamo": 102,
  "fecha_entrega_real": "2024-03-20"
}

PROCESO PASO A PASO:
═══════════════════════════════════════════════════════════

1️⃣ VALIDACIONES INICIALES
   ├─> ¿Existen id_prestamo y fecha_entrega_real? 
   │   NO -> Error 400 "DATOS_INCOMPLETOS"
   │   SI -> Continuar
   │
   └─> ¿Existe el préstamo en BD?
       NO -> Error 404 "PRESTAMO_NO_ENCONTRADO"
       SI -> Continuar

2️⃣ VERIFICAR ESTADO DEL PRÉSTAMO
   ├─> ¿Ya fue devuelto antes?
   │   SI -> Error 400 "PRESTAMO_YA_DEVUELTO"
   │   NO -> Continuar
   │
   └─> ¿El usuario existe?
       NO -> Error 404 "USUARIO_NO_ENCONTRADO"
       SI -> Continuar

3️⃣ CALCULAR RETRASO
   diasRetraso = fecha_entrega_real - fecha_esperada
   
   Ejemplo:
   fecha_esperada:    2024-03-12
   fecha_real:        2024-03-20
   diasRetraso:       8 días

4️⃣ APLICAR SANCIÓN (SI HAY RETRASO)
   if (diasRetraso > 0) {
     usuario.strikes += 1  // ⬅️ KEY: SUMAR +1 AL CONTADOR
     console.log("⚠️ SANCIÓN: Usuario recibió +1 strike")
   }
   
   Antes:  strikes = 0
   Después: strikes = 1

5️⃣ VERIFICAR REGLA DE ORO
   if (usuario.strikes >= 3) {
     usuario.estado = "SUSPENDIDO"  // ⬅️ KEY: CAMBIO AUTOMÁTICO
     console.log("🚫 USUARIO SUSPENDIDO")
   }
   
   Lógica:
   - 0-2 strikes: estado = "ACTIVO"
   - 3 o más strikes: estado = "SUSPENDIDO"

6️⃣ MARCAR PRÉSTAMO COMO DEVUELTO
   prestamo.estado = "DEVUELTO"
   prestamo.fecha_entrega_real = new Date(fecha_entrega_real)

7️⃣ CONSTRUIR RESPUESTA
   return {
     exito: true,
     mensaje: "Equipo devuelto con 8 día(s) de retraso...",
     datos: {
       prestamo: { ... },
       usuario: { 
         id: 2,
         strikes: 1,  // ⬅️ REFLEJA EL CAMBIO
         estado: "ACTIVO"
       },
       sanciones: {
         diasRetraso: 8,
         strikeAplicado: 1,
         totalStrikes: 1,
         suspendido: false
       }
     }
   }

8️⃣ CLIENTE RECIBE RESPUESTA
   Frontend muestra:
   - ✓ Equipo devuelto exitosamente
   - ⚠️ 8 días de retraso
   - 📊 Tu saldo: 1 strike (2 antes de suspensión)
*/

// ============================================================
// 📊 EJEMPLOS DEL MOTOR DE SANCIONES EN ACCIÓN
// ============================================================

/*
EJEMPLO 1: USUARIO SIN SANCIONES
═════════════════════════════════════════════════════════════
Préstamo ID: 101
Fecha esperada: 2024-03-10
Fecha devolución: 2024-03-10  ← ¡EXACTA!

RESULTADO:
- diasRetraso = 0
- NO se suma strike
- usuario.strikes = 0 (sin cambios)
- usuario.estado = "ACTIVO"
- Respuesta: "Equipo devuelto exitosamente."

═════════════════════════════════════════════════════════════
EJEMPLO 2: PRIMERA SANCIÓN (1 STRIKE)
═════════════════════════════════════════════════════════════
Préstamo ID: 102
Fecha esperada: 2024-03-12
Fecha devolución: 2024-03-15  ← 3 días tarde

USUARIO ANTES:
- nombre: "María López"
- strikes: 0
- estado: "ACTIVO"

PROCESO:
1. diasRetraso = 3 días ✓
2. usuario.strikes = 0 + 1 = 1
3. ¿strikes >= 3? NO, sigue ACTIVO
4. prestamo.estado = "DEVUELTO"

USUARIO DESPUÉS:
- nombre: "María López"
- strikes: 1         ⬅️ AUMENTÓ
- estado: "ACTIVO"   ⬅️ SIN CAMBIOS

RESPUESTA:
"Equipo devuelto con 3 día(s) de retraso. 
Se ha registrado una sanción."

═════════════════════════════════════════════════════════════
EJEMPLO 3: TERCERA SANCIÓN (SUSPENSIÓN - EVENT CRÍTICO)
═════════════════════════════════════════════════════════════
Préstamo ID: 103
Fecha esperada: 2024-03-17
Fecha devolución: 2024-03-25  ← 8 días tarde

USUARIO ANTES:
- nombre: "Juan García"
- strikes: 2
- estado: "ACTIVO"

PROCESO:
1. diasRetraso = 8 días ✓
2. usuario.strikes = 2 + 1 = 3  ⬅️ LLEGA AL LÍMITE
3. ¿strikes >= 3? SÍ!!!
4. usuario.estado = "SUSPENDIDO" ⬅️ CAMBIO CRÍTICO
5. prestamo.estado = "DEVUELTO"

USUARIO DESPUÉS:
- nombre: "Juan García"
- strikes: 3               ⬅️ EN EL LÍMITE
- estado: "SUSPENDIDO"     ⬅️ BLOQUEADO!

RESPUESTA:
"Equipo devuelto con 8 día(s) de retraso. 
Se ha registrado una sanción. 
⚠️ ALERTA: Tu cuenta ha sido suspendida por 
exceso de retrasos (3 strikes)."

CONSECUENCIAS:
- NO puede iniciar sesión nuevamente
- NO puede devolver más equipos
- NO puede acceder a rutas protegidas
- REQUIERE intervención de administrador
*/

// ============================================================
// 🔄 FLUJO DE VALIDACIÓN DE PERMISOS
// ============================================================

/*
USUARIO INTENTA ACCEDER A RUTA PROTEGIDA
│
├─ Incluye header: Authorization: Bearer {TOKEN}
│  NO → Error 401: "Token no proporcionado"
│  SÍ → Continuar
│
├─ Middleware verificarToken() ejecuta:
│  ├─ Decodifica token con JWT_SECRET
│  │  Token inválido? → Error 401
│  │  Token expirado? → Error 401
│  │  Token válido → Continuar
│  │
│  └─ req.usuario = datos decodificados
│
├─ Middleware verificarRol() (si está definido):
│  ├─ ¿Usuario tiene rol permitido?
│  │  NO → Error 403: "Permisos insuficientes"
│  │  SÍ → Continuar
│
├─ Middleware verificarEstadoUsuario() (si está definido):
│  ├─ ¿Usuario está SUSPENDIDO?
│  │  SÍ → Error 403: "Usuario suspendido"
│  │  NO → Continuar
│
└─ ✓ ACCESO CONCEDIDO al controlador

EJEMPLO DE CADENA DE MIDDLEWARES:
═════════════════════════════════════════════════════════════

router.post('/devolver', 
  verificarToken,              // 1. Verifica JWT
  verificarEstadoUsuario,      // 2. Verifica que no esté suspendido
  devolverEquipo               // 3. Ejecuta controlador
);

Ejecución:
1. Cliente envía: POST /api/prestamos/devolver + token
2. verificarToken chequea JWT ✓
3. verificarEstadoUsuario chequea estado ✓
4. devolverEquipo ejecuta (si todo OK)
*/

// ============================================================
// 💾 ESTRUCTURA DE DATOS EN MEMORIA
// ============================================================

/*
TABLA: usuariosDB (Array de Objetos)
═════════════════════════════════════════════════════════════

usuariosDB = [
  {
    id: 1,
    nombre: "Juan García",
    email: "juan@example.com",
    password: "$2a$10$QIkQl...",  // Hash bcryptjs
    rol: "ANALISTA",               // O "SUPERVISOR", "ADMIN"
    estado: "ACTIVO",              // O "SUSPENDIDO", "INACTIVO"
    strikes: 0,                    // Contador de sanciones (0-3+)
    fechaCreacion: Date object
  },
  {
    id: 2,
    nombre: "María López",
    email: "maria@example.com",
    password: "$2a$10$QIkQl...",
    rol: "SUPERVISOR",
    estado: "ACTIVO",
    strikes: 2,                    // 2 strikes (cerca de suspensión!)
    fechaCreacion: Date object
  },
  ...
]

═════════════════════════════════════════════════════════════
TABLA: prestamosDB (Array de Objetos)
═════════════════════════════════════════════════════════════

prestamosDB = [
  {
    id_prestamo: 101,
    id_usuario: 1,                 // Referencia a usuario
    id_equipo: "EQUIPO001",        // ID único del equipo
    descripcion_equipo: "Laptop Dell XPS 13",
    fecha_prestamo: "2024-03-01",
    fecha_esperada: "2024-03-10",  // Fecha límite de devolución
    fecha_entrega_real: null,      // null si aún no se devolvió
    estado: "PENDIENTE"            // O "DEVUELTO", "CANCELADO"
  },
  {
    id_prestamo: 102,
    id_usuario: 2,
    id_equipo: "EQUIPO002",
    descripcion_equipo: "Monitor Samsung 27\"",
    fecha_prestamo: "2024-03-05",
    fecha_esperada: "2024-03-12",
    fecha_entrega_real: "2024-03-15",  // Fecha real de devolución
    estado: "DEVUELTO"             // YA DEVUELTO
  },
  ...
]

═════════════════════════════════════════════════════════════
RELACIONES:
- prestamo.id_usuario → usuario.id (FOREIGN KEY)
- Cada usuario puede tener varios préstamos
- Cada préstamo pertenece a un único usuario
*/

// ============================================================
// 🛡️ SEGURIDAD Y BEST PRACTICES
// ============================================================

/*
1. CONTRASEÑAS
   ├─> Se almacenan hasheadas con bcryptjs (10 saltos)
   ├─> Nunca se devuelven en respuestas
   └─> Se validan con bcryptjs.compare()

2. TOKENS JWT
   ├─> Se firman con JWT_SECRET (guardar en .env)
   ├─> Contienen datos básicos del usuario (NO password!)
   ├─> Expiran en 7 días (configurable)
   └─> Se verifican en cada petición protegida

3. MANEJO DE ERRORES
   ├─> Todos en try/catch
   ├─> Respuestas consistentes
   ├─> No se exponen detalles internos en producción
   └─> Se loguean para debugging

4. VALIDACIÓN DE ENTRADA
   ├─> Verificar existencia de campos
   ├─> Convertir tipos de datos (parseInt, etc)
   ├─> Validar rangos de números
   └─> Sanitizar strings si es necesario

5. CONTROL DE ACCESO
   ├─> verificarToken() en rutas protegidas
   ├─> verificarRol() para operaciones administrativas
   └─> verificarEstadoUsuario() para evitar usuarios suspendidos

6. CORS
   ├─> Configurado solo para frontend (5173)
   ├─> Métodos permitidos: GET, POST, PUT, DELETE
   └─> Headers permitidos: Content-Type, Authorization
*/

// ============================================================
// 📱 CÓMO CONECTAR FRONTEND CON BACKEND
// ============================================================

/*
1. FRONTEND HACE REQUEST A BACKEND
   ┌─────────────────────────────────────────┐
   │ Frontend (React)                        │
   │ http://localhost:5173                   │
   │                                         │
   │ fetch('http://localhost:5000/api/...')  │
   └─────────────────────────────────────────┘
           │
           ▼
   ┌─────────────────────────────────────────┐
   │ Backend (Express)                       │
   │ http://localhost:5000                   │
   │                                         │
   │ - Procesa la solicitud                  │
   │ - Aplica lógica de negocio              │
   │ - Retorna JSON                          │
   └─────────────────────────────────────────┘

2. FLUJO DE LOGIN EN FRONTEND
   ├─ Usuario ingresa email y password
   ├─ Frontend hace: POST /api/auth/login
   ├─ Backend valida y retorna token
   ├─ Frontend guarda token en localStorage
   ├─ Frontend incluye token en header: 
   │  Authorization: Bearer {token}
   ├─ Backend verifica token en cada request
   └─ Si válido, concede acceso; si no, rechaza

3. MANEJO DE ERRORES EN FRONTEND
   ├─ if (response.exito === false) {
   │   mostrar mensaje de error
   │ }
   ├─ Verificar response.codigo para error específico
   └─ Actuar según el código (login nuevamente, etc)

EJEMPLO EN JAVASCRIPT:
═════════════════════════════════════════════════════════════
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();

if (data.exito) {
  // Guardar token
  localStorage.setItem('token', data.datos.token);
  // Guardar usuario
  localStorage.setItem('usuario', JSON.stringify(data.datos.usuario));
  // Redirigir a dashboard
} else {
  // Mostrar error
  console.error(data.mensaje);
}

// Devolver equipo (con token)
const response = await fetch('http://localhost:5000/api/prestamos/devolver', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({ id_prestamo: 101, fecha_entrega_real: '2024-03-10' })
});

const data = await response.json();

if (data.exito) {
  if (data.datos.usuario.estado === 'SUSPENDIDO') {
    // Mostrar alerta de suspensión
    alert('¡Tu cuenta ha sido suspendida!');
  } else if (data.datos.sanciones) {
    // Mostrar alerta de sanción
    alert(`Se aplicó una sanción por ${data.datos.sanciones.diasRetraso} días de retraso`);
  }
}
*/

// ============================================================
// 🚀 MEJORAS FUTURAS Y ESCALABILIDAD
// ============================================================

/*
FASE 1: ACTUAL (En Memoria)
├─> Base de datos simulada en memoria
├─> Perfecto para prototipado
├─> Fácil de entender y explicar
└─> Se pierde al reiniciar servidor

FASE 2: PRÓXIMA (Migración a SQL)
├─> Usa MySQL, PostgreSQL o similar
├─> Cambiar solo db.js
├─> El resto del código PERMANECE IGUAL
├─> Persistencia de datos
└─> Ejemplo:
    const usuario = await Usuario.find({ email });
    // En lugar de:
    const usuario = usuariosDB.find(...);

FASE 3: FUNCIONALIDADES ADICIONALES
├─> Notificaciones por email al aplicar sanciones
├─> Panel de admin para gestionar sanciones
├─> Sistema de apelaciones
├─> Reporte de sanciones (PDF)
├─> Integración con sistema de catálogo
├─> Dashboard para usuarios
└─> Audit trail de todas las sanciones

FASE 4: SEGURIDAD ADICIONAL
├─> Rate limiting (máximo X requests por minuto)
├─> Validación de entrada más estricta
├─> Two-factor authentication (2FA)
├─> Logging y monitoreo
├─> Tests automatizados
└─> Documentación con Swagger
*/

// ============================================================
// ✅ CHECKLIST DE CARACTERÍSTICAS IMPLEMENTADAS
// ============================================================

/*
AUTENTICACIÓN:
✅ Login con email y password
✅ Generación de JWT válidos
✅ Middleware de verificación de token
✅ Validación de roles (ADMIN, SUPERVISOR, ANALISTA)
✅ Protección de rutas privadas
✅ Endpoint para perfil del usuario

MOTOR DE SANCIONES:
✅ Cálculo de días de retraso
✅ Aplicación de +1 strike por retraso
✅ Regla de oro: 3 strikes = SUSPENDIDO
✅ Cambio automático de estado
✅ Detalle de sanciones en respuesta
✅ Prevención de acceso a usuarios suspendidos

GESTIÓN DE PRÉSTAMOS:
✅ Endpoint para devolver equipo
✅ Endpoint para obtener préstamos por usuario
✅ Endpoint para ver préstamos pendientes (admin)
✅ Endpoint para detalle de préstamo

CÓDIGO Y DOCUMENTACIÓN:
✅ Código modularizado (routes, controllers, middleware)
✅ Comentarios en español
✅ Manejo de errores con try/catch
✅ Variables de entorno (.env)
✅ Archivo README con guía completa
✅ Archivo TESTING.md con ejemplos

SEGURIDAD:
✅ Contraseñas hasheadas (bcryptjs)
✅ Tokens JWT firmados
✅ CORS configurado
✅ Validación de entrada
✅ Respuestas consistentes
*/
