# 🚀 QUICK START - Prueba el Sistema en 5 Minutos

## 1️⃣ INICIA EL BACKEND

```bash
cd backend
npm run dev
```

**Terminal output esperado:**
```
[INFO] Servidor corriendo en puerto 3001
API disponible en http://localhost:3001
```

---

## 2️⃣ INICIA EL FRONTEND

En **otra terminal**:

```bash
npm run dev
```

**Se abre automáticamente:**
```
http://localhost:5173
```

---

## 3️⃣ LOGIN COMO ADMIN

```
Email: admin1@example.com
Password: admin
```

✅ Redirige a **Catálogo**

---

## 4️⃣ PRUEBA LOS 3 MÓDULOS

### 📦 Módulo Inventario
**Ruta:** `/catalogo`
```
✅ Ver 10 equipos con stock disponible
✅ Stock = stock_total - (préstamos PENDIENTE)
```

### 🎁 Módulo Préstamos
**Ruta:** `/prestamos`
```
1. Click "+ Crear Préstamo"
2. Selecciona: Luis González, Monitor Dell, Hoy
3. ✅ Fecha Devolución calcula automáticamente (15 días hábiles)
4. Click "Crear Préstamo"
5. ✅ Tabla muestra nuevo préstamo con botón Strike GRIS
```

**Mira la consola del servidor:**
```
[ALERTA CORREO] Enviando aviso de atraso a: carlos.ramirez@example.com 
                 por el equipo: Laptop Lenovo ThinkPad
```

### 🚫 Módulo Sanciones
**Ruta:** `/sanciones`
```
✅ 3 contadores: Usuarios Sancionados (2), Suspendidos (2), Strikes (3)
✅ Tabla muestra: Nombre, Correo, EQUIPO ATRASADO, FECHA SANCIÓN, Strikes
✅ Click "Asignar Strike" → Contador aumenta en tiempo real
✅ Click "Perdonar" → Reset a 0 strikes
```

---

## 🧪 TESTS RÁPIDOS

### Test Vencimiento
```
1. Ve a /prestamos
2. Busca préstamo con fondo ROJO (vencido)
3. ✅ Botón "Asignar Strike" está NARANJA (habilitado)
4. Click → "Strike asignado"
5. Ve a /sanciones → Contador aumentó
```

### Test Cálculo Fechas
```
Fecha Préstamo: 27 Marzo (Viernes)
Fecha Devolución: 26 Abril (Viernes) ← 15 días hábiles
```
✅ Saltó: Sábados/domingos

### Test Stock
```
1. Intenta crear préstamo con Micrófono (stock = 1, ya prestado)
2. ❌ Error: "No hay disponibilidad"
```

---

## 📊 CREDENCIALES DE PRUEBA

| Email | Password | Rol | Estado |
|-------|----------|-----|--------|
| admin1 | admin | ADMIN | ACTIVO |
| luis.gonzalez | password123 | ESTUDIANTE | ACTIVO |
| carlos.ramirez | password123 | ESTUDIANTE | SUSPENDIDO |

---

## 🔗 RUTAS PRINCIPALES

| Ruta | Descripción | Requiere |
|------|-------------|----------|
| `/login` | Entrada al sistema | - |
| `/catalogo` | Ver equipos | Login |
| `/prestamos` | Gestionar préstamos | Admin |
| `/sanciones` | Dashboard sanciones | Admin |
| `/solicitudes` | Mis solicitudes | Estudiante |

---

## 📚 DOCUMENTACIÓN COMPLETA

```
📄 INTEGRACION_COMPLETA.md      ← Lee esto para entender TODO
📄 CODIGO_IMPLEMENTADO.md       ← Snippets de código
📄 GUIA_TESTING.md              ← Tests detallados (9 tests)
📄 RESUMEN_EJECUTIVO.md         ← Overview técnico
📄 QUICK_START.md               ← Este archivo
```

---

## ⚡ ATAJOS ÚTILES

**Abrir DevTools:**
```
F12 → Console
```

**Verificar API:**
```javascript
// En console:
fetch('http://localhost:3001/api/sanciones/dashboard')
  .then(r => r.json())
  .then(d => console.log(d.datos))
```

**Ver token:**
```javascript
localStorage.getItem('authToken')
```

**Limpiar caché:**
```
Ctrl+Shift+Delete → Cached files
```

---

## 🐛 SI ALGO NO FUNCIONA

1. **"Network Error"**
   - ¿Backend en `localhost:3001`?
   - Reinicia: `npm run dev`

2. **"Botón gris pero préstamo vencido"**
   - Abre DevTools
   - Verifica fecha en Network tab

3. **"Contador no se actualiza"**
   - Recarga página `/sanciones`
   - Verifica API respond en Network tab

---

## ✅ CHECKLIST RÁ PIDO

- [ ] Backend corriendo (puerto 3001)
- [ ] Frontend corriendo (puerto 5173)
- [ ] Login como admin funciona
- [ ] `/prestamos` muestra tabla
- [ ] Crear préstamo calcula fecha
- [ ] `/sanciones` muestra contadores
- [ ] Botón Strike habilitado en vencidos
- [ ] Contador actualiza después asignar strike
- [ ] Perdonar funciona

---

## 🎯 SIGUIENTES PASOS

**Para testing profundo:**
```
→ Lee GUIA_TESTING.md (9 tests documentados)
```

**Para entender la arquitectura:**
```
→ Lee INTEGRACION_COMPLETA.md (9 secciones)
```

**Para copiar código:**
```
→ Abre CODIGO_IMPLEMENTADO.md (snippets listos)
```

---

## 🎉 ¡LISTO!

El sistema está completamente funcional e integrado.

**Todos los 3 módulos funcionan juntos:**
- 📦 Inventario → Valida stock
- 🎁 Préstamos → Crea con fecha automática
- 🚫 Sanciones → Tracks strikes y auto-suspende

---

**¿Preguntas?** Consulta los documentos anteriores o revisa GUIA_TESTING.md para debugging.

**Versión:** 1.0.0  
**Fecha:** 27 Marzo 2024  
**Status:** ✅ PRODUCCIÓN LISTA
