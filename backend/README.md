# Sistema de Gestión de Equipos (SGE) - Backend

Backend profesional y modularizado para un Sistema de Gestión de Equipos con Motor de Sanciones integrado.

## 🎯 Características Principales

### 1. **Autenticación con JWT**
- Login seguro con contraseñas hasheadas (bcryptjs)
- Generación de tokens JWT con expiración configurable
- Middleware de autenticación para proteger rutas privadas
- Validación de roles (ADMIN, SUPERVISOR, ANALISTA)

### 2. **Motor de Sanciones (Corazón del Negocio)**
- Detección automática de retrasos en devoluciones
- Sistema de strikes: cada retraso suma +1 al contador
- **Regla de Oro**: Si strikes >= 3, el usuario se suspende automáticamente
- Actualización automática del estado del usuario

## 🏗️ Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js        # Lógica de autenticación
│   │   └── prestamosController.js   # Lógica de devoluciones y sanciones
│   ├── routes/
│   │   ├── authRoutes.js            # Rutas de autenticación
│   │   └── prestamosRoutes.js       # Rutas de préstamos
│   ├── middleware/
│   │   └── authMiddleware.js        # Verificación JWT y roles
│   ├── config/
│   │   └── config.js                # Configuración global
│   ├── database/
│   │   └── db.js                    # Base de datos en memoria
│   └── app.js                       # Configuración de Express
├── server.js                         # Entrada principal del servidor
├── package.json                      # Dependencias
├── .env                              # Variables de entorno
└── .gitignore                        # Archivos a ignorar en Git
```

## 📦 Dependencias

```json
{
  "express": "^4.18.2",
  "jsonwebtoken": "^9.1.2",
  "bcryptjs": "^2.4.3",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5"
}
```

## 🚀 Instalación y Uso

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

El archivo `.env` ya contiene configuraciones por defecto:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=tu_clave_secreta_super_segura_aqui_cambiar_en_produccion
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Iniciar el servidor

```bash
# Modo desarrollo (reinicia automáticamente con cambios)
npm run dev

# Modo producción
npm start
```

El servidor se iniciará en `http://localhost:5000`

## 🔐 Autenticación - Endpoints

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta exitosa:**
```json
{
  "exito": true,
  "mensaje": "Inicio de sesión exitoso.",
  "datos": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
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
```

### Obtener Perfil
```http
GET /api/auth/perfil
Authorization: Bearer <token>
```

### Validar Token
```http
GET /api/auth/validar-token
Authorization: Bearer <token>
```

## 🎁 Préstamos y Motor de Sanciones - Endpoints

### Devolver Equipo (MOTOR DE SANCIONES)
```http
POST /api/prestamos/devolver
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_prestamo": 101,
  "fecha_entrega_real": "2024-03-15"
}
```

**Lógica aplicada:**
1. Busca el préstamo en la BD
2. Compara `fecha_esperada` vs `fecha_entrega_real`
3. Si hay retraso:
   - Suma +1 al campo `strikes` del usuario
   - Si `strikes >= 3`: cambia `estado` a `SUSPENDIDO`
4. Actualiza el estado del préstamo a `DEVUELTO`

**Respuesta (SIN retraso):**
```json
{
  "exito": true,
  "mensaje": "Equipo devuelto exitosamente.",
  "datos": {
    "prestamo": {
      "id_prestamo": 101,
      "estado": "DEVUELTO",
      "diasRetraso": 0
    },
    "usuario": {
      "id": 1,
      "nombre": "Juan García",
      "strikes": 0,
      "estado": "ACTIVO"
    },
    "sanciones": null
  }
}
```

**Respuesta (CON retraso):**
```json
{
  "exito": true,
  "mensaje": "Equipo devuelto con 5 día(s) de retraso. Se ha registrado una sanción.",
  "datos": {
    "prestamo": {
      "id_prestamo": 102,
      "estado": "DEVUELTO",
      "diasRetraso": 5
    },
    "usuario": {
      "id": 2,
      "nombre": "María López",
      "strikes": 1,
      "estado": "ACTIVO"
    },
    "sanciones": {
      "tipo": "RETRASO_EN_DEVOLUCION",
      "diasRetraso": 5,
      "strikeAplicado": 1,
      "totalStrikes": 1,
      "suspendido": false
    }
  }
}
```

**Respuesta (USUARIO SUSPENDIDO por 3 strikes):**
```json
{
  "exito": true,
  "mensaje": "Equipo devuelto con 2 día(s) de retraso. Se ha registrado una sanción. ⚠️ ALERTA: Tu cuenta ha sido suspendida por exceso de retrasos (3 strikes).",
  "datos": {
    "usuario": {
      "id": 1,
      "nombre": "Juan García",
      "strikes": 3,
      "estado": "SUSPENDIDO"
    },
    "sanciones": {
      "suspendido": true
    }
  }
}
```

### Obtener Préstamos del Usuario
```http
GET /api/prestamos/usuario/1
Authorization: Bearer <token>
```

### Obtener Préstamos Pendientes
```http
GET /api/prestamos/pendientes
Authorization: Bearer <token>
```
**Nota:** Solo SUPERVISOR o ADMIN pueden acceder.

### Obtener Detalle del Préstamo
```http
GET /api/prestamos/101
Authorization: Bearer <token>
```

## 👥 Usuarios de Prueba

| Email | Password | Rol | Estado |
|-------|----------|-----|--------|
| juan@example.com | password123 | ANALISTA | ACTIVO |
| maria@example.com | password123 | SUPERVISOR | ACTIVO |
| carlos@example.com | password123 | ANALISTA | ACTIVO |

## 🧪 Casos de Prueba para Línea de Sanciones

### Caso 1: Sin Retraso
- Préstamo esperado: 2024-03-10
- Devolución real: 2024-03-10
- **Resultado:** Sin retraso, sin strikes

### Caso 2: Con Retraso Menor
- Préstamo esperado: 2024-03-10
- Devolución real: 2024-03-15
- **Resultado:** 5 días de retraso, +1 strike

### Caso 3: Suspensión por 3 Strikes
- Usuario con 2 strikes existentes
- Nueva devolución con retraso
- **Resultado:** +1 strike = 3 total → SUSPENDIDO automáticamente

## 📋 Explicación de la Lógica de Sanciones

### Algoritmo del Motor de Sanciones

```
1. Usuario devuelve equipo
2. Sistema compara:
   fecha_entrega_real > fecha_esperada?
   
3. SI: Hay retraso
   - Sumar +1 al campo strikes
   - Registrar días de retraso
   
4. Verificar: strikes >= 3?
   SI: usuario.estado = "SUSPENDIDO"
   NO: usuario.estado se mantiene "ACTIVO"
   
5. Actualizar préstamo.estado = "DEVUELTO"
6. Retornar respuesta con detalles de sanciones
```

### Regla de Oro
> **Si el contador de strikes llega a 3, el estado del usuario pasa a "SUSPENDIDO"**
> Un usuario suspendido NO puede devolver equipos hasta que sea reactivado por un administrador.

## 🛡️ Características de Seguridad

- ✅ Contraseñas hasheadas con bcryptjs (10 saltos)
- ✅ Tokens JWT con expiración
- ✅ Middleware de autenticación en rutas protegidas
- ✅ Validación de roles por endpoint
- ✅ Manejo de errores con try/catch
- ✅ CORS configurado
- ✅ Validación de entrada de datos

## 🔄 Migración a Base de Datos SQL (Próximo Paso)

Para migrar de memoria a SQL:

1. Reemplazar `db.js` con un cliente de base de datos (MySQL, PostgreSQL, etc.)
2. Mantener la misma estructura de funciones y lógica
3. Cambiar las queries de memoria por queries SQL
4. El resto del código (controllers, routes, middleware) NO requiere cambios

## 📝 Notas Importantes

- El código está completamente comentado en español
- Cada función tiene su documentación JSDoc
- Los errores son capturados con try/catch
- Las respuestas siguen un formato estándar: `{ exito, mensaje, datos, codigo }`
- La base de datos es simulada en memoria para esta versión
- Los tokens JWT se generan con los datos del usuario incluidos

## 🎓 Para Presentación ante el Profesor

Puntos clave a explicar:

1. **Modularización:** Routes → Controllers → Middleware
2. **Motor de Sanciones:** Lógica de detección de retrasos y aplicación de strikes
3. **Regla de Oro:** Automatización de suspensión al alcanzar 3 strikes
4. **Seguridad:** JWT, bcrypt, validación de roles
5. **Escalabilidad:** Estructura preparada para migración a SQL
6. **Manejo de Errores:** Try/catch en todos los controladores

---

**Autor:** Desarrollador Backend Senior  
**Versión:** 1.0.0  
**Última actualización:** Marzo 2024
