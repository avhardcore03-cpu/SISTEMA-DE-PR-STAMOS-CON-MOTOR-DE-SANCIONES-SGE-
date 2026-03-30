/**
 * GUÍA DE PRUEBAS DEL BACKEND - SGE
 * Ejemplos de solicitudes HTTP para probar los endpoints
 * 
 * Puedes usar:
 * - Postman (aplicación de escritorio)
 * - cURL (terminal)
 * - Thunder Client (extensión VS Code)
 * - REST Client (extensión VS Code)
 */

// ============================================================
// 1️⃣  PRUEBAS DE AUTENTICACIÓN
// ============================================================

/*
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}

RESPUESTA ESPERADA:
{
  "exito": true,
  "mensaje": "Inicio de sesión exitoso.",
  "datos": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "nombre": "Juan García",
      "email": "juan@example.com",
      "rol": "ANALISTA",
      "estado": "ACTIVO",
      "strikes": 0
    }
  }
}

⚠️ GUARDA EL TOKEN - Lo necesitarás para los siguientes tests
*/

/*
GET http://localhost:5000/api/auth/perfil
Authorization: Bearer {TOKEN_AQUI}

RESPUESTA ESPERADA:
{
  "exito": true,
  "mensaje": "Datos del perfil obtenidos correctamente.",
  "datos": {
    "id": 1,
    "email": "juan@example.com",
    "nombre": "Juan García",
    "rol": "ANALISTA",
    "estado": "ACTIVO",
    "strikes": 0
  }
}
*/

/*
GET http://localhost:5000/api/auth/validar-token
Authorization: Bearer {TOKEN_AQUI}

RESPUESTA ESPERADA:
{
  "exito": true,
  "mensaje": "Token válido.",
  "datos": { ... datos del usuario ... }
}
*/

// ============================================================
// 2️⃣  PRUEBAS DEL MOTOR DE SANCIONES - DEVOLVER EQUIPO
// ============================================================

/*
TEST CASE 1: Devolución SIN RETRASO
POST http://localhost:5000/api/prestamos/devolver
Authorization: Bearer {TOKEN_AQUI}
Content-Type: application/json

{
  "id_prestamo": 101,
  "fecha_entrega_real": "2024-03-10"
}

RESPUESTA ESPERADA:
{
  "exito": true,
  "mensaje": "Equipo devuelto exitosamente.",
  "datos": {
    "prestamo": {
      "id_prestamo": 101,
      "id_equipo": "EQUIPO001",
      "descripcion_equipo": "Laptop Dell XPS 13",
      "fecha_prestamo": "2024-03-01T00:00:00.000Z",
      "fecha_esperada": "2024-03-10T00:00:00.000Z",
      "fecha_entrega_real": "2024-03-10T00:00:00.000Z",
      "estado": "DEVUELTO",
      "diasRetraso": 0
    },
    "usuario": {
      "id": 1,
      "nombre": "Juan García",
      "strikes": 0,
      "estado": "ACTIVO",
      "huboRetraso": false
    },
    "sanciones": null
  }
}
*/

/*
TEST CASE 2: Devolución CON RETRASO (aplicar sanción)
POST http://localhost:5000/api/prestamos/devolver
Authorization: Bearer {TOKEN_AQUI}
Content-Type: application/json

{
  "id_prestamo": 102,
  "fecha_entrega_real": "2024-03-20"
}

NOTA: El préstamo 102 tiene fecha_esperada = "2024-03-12"
--> Retraso = 8 días

RESPUESTA ESPERADA:
{
  "exito": true,
  "mensaje": "Equipo devuelto con 8 día(s) de retraso. Se ha registrado una sanción.",
  "datos": {
    "usuario": {
      "id": 2,
      "nombre": "María López",
      "strikes": 1,          // ⬅️ STRIKES AUMENTÓ DE 0 A 1
      "estado": "ACTIVO",
      "strikesAntesDelRetraso": 0,
      "huboRetraso": true
    },
    "sanciones": {
      "tipo": "RETRASO_EN_DEVOLUCION",
      "diasRetraso": 8,
      "strikeAplicado": 1,
      "totalStrikes": 1,
      "suspendido": false
    }
  }
}
*/

/*
TEST CASE 3: SUSPENSIÓN AUTOMÁTICA (3 strikes)

PRECONDICIONES:
1. Usuario con 2 strikes existentes
2. Nueva devolución con retraso

POST http://localhost:5000/api/prestamos/devolver
Authorization: Bearer {TOKEN_AQUI}
Content-Type: application/json

{
  "id_prestamo": 103,
  "fecha_entrega_real": "2024-03-25"  // Con retraso
}

RESULTADO:
- Usuario tenía 2 strikes antes
- Se aplica +1 strike
- Total = 3 strikes
- AUTOMÁTICAMENTE: estado CAMBIA A "SUSPENDIDO" ⚠️

RESPUESTA ESPERADA:
{
  "exito": true,
  "mensaje": "Equipo devuelto con X día(s) de retraso. Se ha registrado una sanción. 
             ⚠️ ALERTA: Tu cuenta ha sido suspendida por exceso de retrasos (3 strikes).",
  "datos": {
    "usuario": {
      "id": 1,
      "nombre": "Juan García",
      "strikes": 3,
      "estado": "SUSPENDIDO",  // ⬅️ ESTADO CAMBIÓ AUTOMÁTICAMENTE
      "huboRetraso": true
    },
    "sanciones": {
      "suspendido": true
    }
  }
}
*/

// ============================================================
// 3️⃣  PRUEBAS DE OBTENCIÓN DE PRÉSTAMOS
// ============================================================

/*
GET http://localhost:5000/api/prestamos/usuario/1
Authorization: Bearer {TOKEN_AQUI}

Obtiene todos los préstamos (pendientes y devueltos) del usuario 1

RESPUESTA ESPERADA:
{
  "exito": true,
  "mensaje": "Se encontraron 2 préstamo(s).",
  "datos": {
    "usuario": {
      "id": 1,
      "nombre": "Juan García",
      "email": "juan@example.com",
      "rol": "ANALISTA",
      "estado": "ACTIVO",
      "strikes": 0
    },
    "prestamos": [
      {
        "id_prestamo": 101,
        "id_usuario": 1,
        "id_equipo": "EQUIPO001",
        "descripcion_equipo": "Laptop Dell XPS 13",
        "estado": "DEVUELTO"
      },
      {
        "id_prestamo": 103,
        "id_usuario": 1,
        "id_equipo": "EQUIPO003",
        "descripcion_equipo": "Mouse Logitech",
        "estado": "PENDIENTE"
      }
    ]
  }
}
*/

/*
GET http://localhost:5000/api/prestamos/pendientes
Authorization: Bearer {TOKEN_AQUI}

IMPORTANTE: Solo SUPERVISOR o ADMIN pueden acceder
Usa token de Maria (maria@example.com) que tiene rol SUPERVISOR

RESPUESTA ESPERADA:
{
  "exito": true,
  "mensaje": "Se encontraron 2 préstamo(s) pendiente(s).",
  "datos": {
    "cantidad": 2,
    "prestamos": [
      {
        "id_prestamo": 101,
        "estado": "PENDIENTE"
      },
      {
        "id_prestamo": 103,
        "estado": "PENDIENTE"
      }
    ]
  }
}
*/

/*
GET http://localhost:5000/api/prestamos/101
Authorization: Bearer {TOKEN_AQUI}

Obtiene el detalle de un préstamo específico

RESPUESTA ESPERADA:
{
  "exito": true,
  "mensaje": "Detalle del préstamo obtenido correctamente.",
  "datos": {
    "prestamo": {
      "id_prestamo": 101,
      "id_usuario": 1,
      "id_equipo": "EQUIPO001",
      "descripcion_equipo": "Laptop Dell XPS 13",
      ...
    },
    "usuario": {
      "id": 1,
      "nombre": "Juan García",
      "strikes": 0,
      "estado": "ACTIVO"
    }
  }
}
*/

// ============================================================
// 4️⃣  ERRORES COMUNES Y RESPUESTAS
// ============================================================

/*
ERROR: Falta el token
GET http://localhost:5000/api/auth/perfil

RESPUESTA:
{
  "exito": false,
  "mensaje": "Token no proporcionado. Acceso denegado.",
  "codigo": "TOKEN_NO_PROPORCIONADO"
}
*/

/*
ERROR: Token expirado
GET http://localhost:5000/api/auth/perfil
Authorization: Bearer {TOKEN_EXPIRADO}

RESPUESTA:
{
  "exito": false,
  "mensaje": "Token expirado. Por favor, inicie sesión nuevamente.",
  "codigo": "TOKEN_EXPIRADO"
}
*/

/*
ERROR: Credenciales incorrectas
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password_INCORRECTO"
}

RESPUESTA:
{
  "exito": false,
  "mensaje": "Credenciales inválidas. Contraseña incorrecta.",
  "codigo": "PASSWORD_INCORRECTO"
}
*/

/*
ERROR: Usuario suspendido intenta iniciar sesión
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "usuario_suspendido@example.com",
  "password": "password123"
}

RESPUESTA:
{
  "exito": false,
  "mensaje": "Tu cuenta ha sido suspendida por exceso de retrasos en devoluciones.",
  "codigo": "USUARIO_SUSPENDIDO",
  "datos": {
    "strikes": 3,
    "estado": "SUSPENDIDO"
  }
}
*/

/*
ERROR: Usuario suspendido intenta devolver equipo
POST http://localhost:5000/api/prestamos/devolver
Authorization: Bearer {TOKEN_USUARIO_SUSPENDIDO}
Content-Type: application/json

{
  "id_prestamo": 104,
  "fecha_entrega_real": "2024-03-28"
}

RESPUESTA:
{
  "exito": false,
  "mensaje": "Tu cuenta ha sido suspendida por exceso de retrasos en devoluciones.",
  "codigo": "USUARIO_SUSPENDIDO"
}
*/

// ============================================================
// 📝 COMANDOS cURL PARA TERMINAL
// ============================================================

/*
1. LOGIN CON cURL:

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","password":"password123"}'

2. DEVOLVER EQUIPO CON RETRASO:

curl -X POST http://localhost:5000/api/prestamos/devolver \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"id_prestamo":102,"fecha_entrega_real":"2024-03-20"}'

3. OBTENER PERFIL:

curl -X GET http://localhost:5000/api/auth/perfil \
  -H "Authorization: Bearer <TOKEN>"

4. OBTENER PRÉSTAMOS DEL USUARIO:

curl -X GET http://localhost:5000/api/prestamos/usuario/1 \
  -H "Authorization: Bearer <TOKEN>"
*/

// ============================================================
// 🎯 ESCENARIOS DE PRUEBA DEL MOTOR DE SANCIONES
// ============================================================

/*
ESCENARIO 1: Camino Feliz (Sin sanciones)
═══════════════════════════════════════════
1. Usuario inicia sesión → Token obtenido ✓
2. Devuelve equipo a tiempo → Sin retraso, 0 strikes ✓
3. Puede seguir usando el sistema normalmente ✓

ESCENARIO 2: Primeira Sanción
═════════════════════════════════════════════
1. Usuario devuelve equipo CON 5 días de retraso
2. Sistema aplica +1 strike → Total: 1 strike
3. Usuario sigue siendo ACTIVO
4. Recibe alerta por correo (implementar después) ⚠️

ESCENARIO 3: Segunda Sanción
═════════════════════════════════════════════
1. Usuario ya tiene 1 strike
2. Devuelve OTRO equipo CON retraso
3. Sistema aplica +1 strike → Total: 2 strikes
4. Usuario sigue siendo ACTIVO
5. Le faltan 1 strike para suspensión ⚠️

ESCENARIO 4: SUSPENSIÓN POR 3 STRIKES (Evento Crítico)
═══════════════════════════════════════════════════════════
1. Usuario ya tiene 2 strikes
2. Devuelve equipo CON retraso
3. Sistema aplica +1 strike → Total: 3 STRIKES
4. ¡¡ AUTOMÁTICAMENTE SUSPENDE AL USUARIO !!
5. Usuario NO PUEDE:
   - Iniciar sesión
   - Devolver equipos
   - Acceder a rutas protegidas
6. Requiere intervención de ADMIN para reactivar
*/
