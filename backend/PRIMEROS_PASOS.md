📖 GUÍA DE PRIMEROS PASOS - Backend SGE
==========================================================

👋 BIENVENIDO

Acabas de recibir un backend COMPLETO y FUNCIONAL para tu 
Sistema de Gestión de Equipos con Motor de Sanciones.

Este documento te guiará paso a paso para:
1. Entender qué se ha creado
2. Instalar las dependencias
3. Ejecutar el servidor
4. Probar los endpoints
5. Conectar con tu frontend

==========================================================
1️⃣  ¿QUÉ TIENES?
==========================================================

✅ Backend en Node.js + Express
✅ Autenticación con JWT  
✅ Motor de Sanciones automático (CORAZÓN DEL SISTEMA)
✅ Base de datos en memoria (lista para migrar a SQL)
✅ Código 100% comentado en español
✅ 4 archivos de documentación profesional
✅ Ejemplos de prueba incluidos

UBICACIÓN: backend/ (nueva carpeta en tu proyecto)

==========================================================
2️⃣  INSTALACIÓN RÁPIDA (3 PASOS)
==========================================================

PASO 1: Abrir terminal
────────────────────────────────────────────────────
Windows: Abre CMD o PowerShell en la carpeta backend
Linux/Mac: Abre Terminal en la carpeta backend

PASO 2: Instalar dependencias
────────────────────────────────────────────────────
Ejecuta el comando:

  npm install

Esto descargará todos los paquetes necesarios (express, jwt, etc)

Esperado: "up to date, audited X packages"

PASO 3: Ejecutar servidor
────────────────────────────────────────────────────
Ejecuta el comando:

  npm run dev

Esperado: Verás algo como:
  ╔══════════════════════════════════════════════════╗
  ║    SISTEMA DE GESTIÓN DE EQUIPOS (SGE)          ║
  ║      Backend iniciado correctamente             ║
  ╚══════════════════════════════════════════════════╝

  🚀 Servidor ejecutándose en: http://localhost:3001

✅ ¡Listo! El servidor está corriendo

==========================================================
3️⃣  PROBAR EL SERVIDOR
==========================================================

OPCIÓN A: En el navegador
────────────────────────────────────────────────────
Abre: http://localhost:3001

Deberías ver un JSON de bienvenida con todos los endpoints

OPCIÓN B: Con Postman (Recomendado para pruebas)
────────────────────────────────────────────────────
1. Descarga Postman: https://www.postman.com/downloads/
2. Crea nueva request
3. POST (seleccionar método)
4. URL: http://localhost:3001/api/auth/login
5. Body (seleccionar JSON):
{
  "email": "juan@example.com",
  "password": "password123"
}
6. Click en "Send"

Esperado: Recibirás un token JWT

CREDENCIALES DE PRUEBA:
juan@example.com     / password123  (ANALISTA)
maria@example.com    / password123  (SUPERVISOR)
carlos@example.com   / password123  (ANALISTA)

==========================================================
4️⃣  PRIMERAS PRUEBAS DEL MOTOR DE SANCIONES
==========================================================

Ahora vamos a probar el corazón del sistema: 
Las sanciones automáticas

PRUEBA 1: Devolver equipo SIN RETRASO
────────────────────────────────────────────────────
1. Abre Postman
2. Token: Usa el que obtuviste del login
3. POST http://localhost:3001/api/prestamos/devolver
4. Headers:
   Authorization | Bearer (pega aquí tu token)
5. Body (JSON):
{
  "id_prestamo": 101,
  "fecha_entrega_real": "2024-03-10"
}
6. Send

Esperado:
- Mensaje: "Equipo devuelto exitosamente."
- usuario.strikes = 0 (sin cambios)
- usuario.estado = "ACTIVO"
- sanciones = null

PRUEBA 2: Devolver equipo CON RETRASO
────────────────────────────────────────────────────
1. POST http://localhost:3001/api/prestamos/devolver
2. Body:
{
  "id_prestamo": 102,
  "fecha_entrega_real": "2024-03-20"
}
3. Send

Esperado:
- Mensaje: "...con 8 día(s) de retraso..."
- usuario.strikes = 1 (⬆️ AUMENTÓ!)
- usuario.estado = "ACTIVO" (aún activo)
- sanciones.diasRetraso = 8
- sanciones.strikeAplicado = 1

⭐ LA SANCIÓN SE APLICÓ AUTOMÁTICAMENTE

PRUEBA 3: El motor en acción (3 strikes = SUSPENDIDO)
────────────────────────────────────────────────────
Para ver la suspensión, necesitas un usuario con 2 strikes.

Actualmente: María López tiene 0 strikes en la BD.
(Si quieres probar la suspensión, edita db.js: 
 cambia "strikes": 0 a "strikes": 2 en usuariosDB)

Luego devuelve un equipo con retraso:
{
  "id_prestamo": 102,
  "fecha_entrega_real": "2024-03-20"
}

Esperado: 2 + 1 = 3 strikes
→ usuario.estado = "SUSPENDIDO" ✶ AUTOMÁTICO
→ usuario NO PUEDE hacer nada más

==========================================================
5️⃣  DOCUMENTACIÓN DISPONIBLE
==========================================================

Abre estos archivos en el directorio backend/:

📄 RESUMEN.md
   → Explicación ejecutiva de todo
   → De lectura obligatoria PRIMERO

📄 README.md
   → Guía de instalación completa
   → Todos los endpoints documentados
   → Credenciales y ejemplos

📄 ARQUITECTURA.md
   → Diagramas técnicos
   → Flujos de autenticación
   → Flujo del motor de sanciones
   → Para explicar ante tu profesor

📄 TESTING.md
   → Ejemplos de requests listos para copiar/pegar
   → Todos los casos de uso
   → Errores comunes
   → Comandos cURL

📄 ESTRUCTURA.md
   → Vista general de carpetas
   → Qué hay en cada archivo
   → Estadísticas del proyecto

==========================================================
6️⃣  CONECTAR FRONTEND CON BACKEND
==========================================================

Tu frontend React (en / o en /src) necesita hacer 
requests al backend. 

DESDE TU CÓDIGO REACT:

1. LOGIN:
────────────────────────────────────────────────────
const handleLogin = async (email, password) => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
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
    // Redirigir al dashboard
  } else {
    // Mostrar error
    alert(data.mensaje);
  }
};

2. DEVOLVER EQUIPO:
────────────────────────────────────────────────────
const handleDevolverEquipo = async (id_prestamo, fecha) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3001/api/prestamos/devolver', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // ← IMPORTANTE!
    },
    body: JSON.stringify({
      id_prestamo: id_prestamo,
      fecha_entrega_real: fecha
    })
  });
  
  const data = await response.json();
  
  if (data.exito) {
    // Verificar si fue suspendido
    if (data.datos.usuario.estado === 'SUSPENDIDO') {
      alert('⚠️ ¡Tu cuenta ha sido suspendida!');
    } else if (data.datos.sanciones) {
      alert(`Se aplicó sanción por ${data.datos.sanciones.diasRetraso} días`);
    }
  }
};

==========================================================
7️⃣  ERRORES COMUNES Y SOLUCIONES
==========================================================

❌ "Puerto 3001 ya está en uso"
──────────────────────────────────────────────────
Solución: Cambiar puerto en .env
PORT=5001

Luego ejecutar: npm run dev

❌ "Cannot find module 'express'"
──────────────────────────────────────────────────
Solución: Faltó ejecutar npm install
Ejecutar: npm install

❌ "Token no proporcionado"
──────────────────────────────────────────────────
Solución: El header Authorization está mal
Correcto: Authorization: Bearer eyJhbGci...
Sin "Bearer": Falla

❌ "Credenciales inválidas"
──────────────────────────────────────────────────
Solución: Email o password incorrectos
Usuarios válidos:
- juan@example.com / password123
- maria@example.com / password123
- carlos@example.com / password123

❌ "CORS error"
──────────────────────────────────────────────────
Solución: Frontend está en puerto diferente
Editar backend/.env:
FRONTEND_URL=http://localhost:PUERTO_DEL_FRONTEND

Luego reiniciar servidor: npm run dev

==========================================================
8️⃣  PRÓXIMAS ACCIONES RECOMENDADAS
==========================================================

CORTO PLAZO (Hoy):
✅ Instalar y ejecutar backend
✅ Probar login con credenciales de prueba
✅ Probar devolver equipo (sin retraso)
✅ Probar devolver equipo (con retraso)
✅ Observar cómo suben los strikes

MEDIANO PLAZO (Esta semana):
✅ Leer ARQUITECTURA.md para entender bien el sistema
✅ Preparar presentación ante profesor
✅ Conectar frontend con backend
✅ Probar flujo completo de login → devolución → sanciones

LARGO PLAZO (Después):
✅ Migrar de base de datos en memoria a SQL
✅ Agregar validaciones adicionales
✅ Implementar notificaciones por email
✅ Crear dashboard de admin para gestionar sanciones

==========================================================
9️⃣  PARA TU PROFESOR
==========================================================

PUNTOS A DESTACAR:

1. MOTOR DE SANCIONES
   "Es un sistema automático que detecta retrasos,
   aplica sanciones y suspende automáticamente
   al usuario al llegar a 3 strikes."

2. SEGURIDAD
   "Usa JWT para autenticación, bcryptjs para
   contraseñas, validación de permisos por rol."

3. MODULARIZACIÓN
   "Routes → Controllers → Middleware
   Cada capa tiene responsabilidad única."

4. ESCALABILIDAD
   "Está listo para migrar a SQL sin cambiar
   la lógica principal."

5. DOCUMENTACIÓN
   "Código completo comentado en español,
   con ejemplos y documentación técnica."

==========================================================
1️⃣0️⃣  ¡LISTO!
==========================================================

Felicidades 🎉

Ya tienes:
✅ Backend funcional
✅ Motor de sanciones implementado
✅ Código profesional
✅ Documentación completa
✅ Ejemplos de prueba

Próximo paso: Instala y ejecuta!

  cd backend
  npm install
  npm run dev

¿Preguntas? Lee RESUMEN.md o README.md en la carpeta backend/

¡Que te vaya bien en tu presentación! 🚀
