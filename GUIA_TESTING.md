# 🧪 GUÍA COMPLETA DE TESTING - INTEGRACIÓN PROFUNDA

## 📋 SETUP REQUERIDO

**Credenciales de Prueba:**
```
=== ADMIN ===
Email: admin1@example.com  | Password: admin
Email: admin2@example.com  | Password: admin

=== ESTUDIANTES ACTIVOS ===
Email: luis.gonzalez@example.com     | Password: password123
Email: iris.martinez@example.com     | Password: password123
Email: andrea.lopez@example.com      | Password: password123

=== ESTUDIANTES SUSPENDIDOS ===
Email: carlos.ramirez@example.com    | Password: password123 (1 strike)
Email: marta.sanchez@example.com     | Password: password123 (2 strikes)
```

---

## 🧪 TEST 1: Cálculo Automático de 15 Días Hábiles

### 🎯 Objetivo
Verificar que crear un préstamo calcula automáticamente la fecha de devolución saltando fines de semana.

### ✅ Pasos
1. Login como **admin1@example.com** / admin
2. Ve a **`/prestamos`**
3. Click **"+ Crear Préstamo"**
4. Selecciona:
   - **Estudiante**: Luis González
   - **Equipo**: Monitor Dell UltraSharp
   - **Fecha de Préstamo**: Hoy (ej: 27/03/2024)
5. Observa **Fecha de Devolución**: Debe ser automática (read-only)
6. Click **"Crear Préstamo"**

### ✔️ Validaciones Esperadas
```
✅ Mensaje: "✅ Préstamo creado. Devolución: [fecha calculada]"
✅ Tabla se actualiza con nuevo préstamo
✅ Fecha Devolución = 15 días hábiles después (ej: 22/04/2024)
✅ Estado = PENDIENTE
✅ Botón "Asignar Strike" = GRIS/DESHABILITADO
```

### 🔬 Validación Técnica
Si el préstamo es **27 de marzo (viernes)**:
- Salta: 30-31 mar (sáb-dom), 6-7 abril (sáb-dom), 13-14 (sáb-dom), 20-21 (sáb-dom)
- Resultado: **26 de abril (viernes)**

### ❌ Edge Cases
```
❌ Intenta sin llenar campos
   → Error: "Completa todos los campos"

❌ Equipo sin stock disponible
   → Error: "El equipo '...' no tiene disponibilidad"
```
```

**Esperado:**
```json
{
  "id": 1,
  "nombre": "Laptop Lenovo ThinkPad",
  "stock_total": 2,
  "stock_disponible": 1,
  "stock_prestado": 1,
  "estado": "Disponible"  // Es "Disponible" porque quedan 1
}
```

### Paso 2: Llena todo con préstamos ficticios
Si agregas 2 préstamos PENDIENTE más de Laptop (ID 1):
- stock_total = 2
- stock_prestado = 3
- stock_disponible = -1 → 0 (MaxValue)
- estado = "En Mantenimiento" (automático)

---

## 🧪 TEST 5: Panel de Sanciones (Admin)

### Paso 1: Accede a la URL
```
http://localhost:5173/sanciones  (o la ruta que uses)
```

### Paso 2: Verifica la tabla
**Esperado:** Ver 4 usuarios sancionados:
- Lina Campos: 3 strikes, "Laptop Lenovo ThinkPad"
- Diego Morales: 3 strikes, "Videoproyector BenQ"
- Paula Guzmán: 2 strikes, "Tablet Samsung Galaxy Tab"
- Roberto Soto: 1 strike, "Cable HDMI Premium"

### Paso 3: Haz clic en "Perdonar" para Lina
**Esperado:**

---

## 🧪 TEST 2: Alertas de Préstamos Vencidos en Consola

### 🎯 Objetivo
Verificar que el backend loguea `[ALERTA CORREO]` para cada préstamo vencido.

### ✅ Pasos
1. Abre **consola del servidor** (terminal donde corre npm run dev del backend)
2. Login a `/prestamos` como cualquier admin
3. La página carga automáticamente todos los préstamos
4. **Observa la consola del servidor**

### ✔️ Validaciones Esperadas
```
[ALERTA CORREO] Enviando aviso de atraso a: carlos.ramirez@example.com 
                 por el equipo: Laptop Lenovo ThinkPad

[ALERTA CORREO] Enviando aviso de atraso a: marta.sanchez@example.com 
                 por el equipo: Videoproyector BenQ
```
✅ Una línea por cada préstamo vencido (estado PENDIENTE y fecha_devolucion < hoy)

---

## 🧪 TEST 3: Botón "Asignar Strike" Condicional

### 🎯 Objetivo
Verificar que el botón solo se habilita si el préstamo está vencido.

### ✅ Pasos
1. Login como **admin1@example.com**
2. Ve a `/prestamos`
3. **Busca un préstamo con estado PENDIENTE y fecha_devolucion VENCIDA**
   - Ejemplo: ID 101, Carlos Ramírez, marca de color rojo
4. Observa el botón "Asignar Strike"

### ✔️ Validaciones
```
✅ Préstamo NO vencido → Botón GRIS (deshabilitado)
                        Hover muestra: "No puedes asignar strike a un préstamo vigente"

✅ Préstamo VENCIDO → Botón NARANJA (habilitado)
                      Hover muestra: "Asignar strike por atraso"
                      Color: orange-500
```

### ✅ Click en el botón (si está vencido)
```
✅ Mensaje: "⚠️ Strike asignado a Carlos Ramírez. Strikes: 2/3"
✅ Tabla se actualiza inmediatamente
✅ Ir a /sanciones → Carlos ahora muestra 2 strikes
```

### ❌ Edge Cases
```
❌ Intenta asignar strike a préstamo no vencido
   → Error: "No se puede asignar un strike a un préstamo que aún no ha vencido."

❌ Intenta asignar strike a préstamo ya DEVUELTO
   → Error: "Solo se pueden asignar strikes a préstamos en estado PENDIENTE."
```

---

## 🧪 TEST 4: Dashboard Contadores Dinámicos

### 🎯 Objetivo
Verificar que `/sanciones` obtiene datos reales del endpoint `/api/sanciones/dashboard`.

### ✅ Pasos
1. Login como **admin1@example.com**
2. Ve a `/sanciones`
3. Observa **3 contadores en la parte superior**:
   - "Usuarios Sancionados"
   - "Suspendidos"
   - "Total de Strikes"

### ✔️ Validaciones Base (con datos iniciales)
```
✅ Usuarios Sancionados: 2 (Carlos y Marta)
✅ Suspendidos: 2 (ambos estado SUSPENDIDO)
✅ Total de Strikes: 3 (1 + 2)
```

### ✅ Test Dinámico (después de asignar strike)
1. Ve a `/prestamos`
2. Asigna un strike a quién tenga <3 strikes
3. **Sin refrescar**, regresa a `/sanciones` por navigation
4. **Los contadores deben haber aumentado automáticamente**

```
✅ Total de Strikes: ahora 4 (increased by 1)
✅ Usuarios Sancionados: actualizado si es usuario nuevo
✅ Suspendidos: aumenta en 1 si llega a 3 strikes
```

### 🔬 Test de API Directa
```bash
curl http://localhost:3001/api/sanciones/dashboard
```

**Respuesta esperada:**
```json
{
  "exito": true,
  "datos": {
    "usuarios_sancionados": 2,
    "suspendidos": 2,
    "total_strikes": 3,
    "sancionados_detail": [
      {
        "id": 3,
        "nombre": "Carlos Ramírez",
        "email": "carlos.ramirez@example.com",
        "tipo_documento": "CC",
        "identificacion": "1001234567",
        "strikes": 1,
        "estado": "SUSPENDIDO",
        "equipo_retenido": "Laptop Lenovo ThinkPad",
        "fecha_sancion": "2024-03-27T10:30:00Z"
      },
      {
        "id": 4,
        "nombre": "Marta Sánchez",
        "email": "marta.sanchez@example.com",
        "tipo_documento": "TI",
        "identificacion": "1002345678",
        "strikes": 2,
        "estado": "SUSPENDIDO",
        "equipo_retenido": "Videoproyector BenQ",
        "fecha_sancion": "2024-03-27T14:15:00Z"
      }
    ]
  }
}
```

---

## 🧪 TEST 5: Tabla de Sanciones - Nuevas Columnas

### 🎯 Objetivo
Verificar que la tabla muestra "Equipo Atrasado" y "Fecha de Sanción" correctamente.

### ✅ Pasos
1. Login como **admin1@example.com**
2. Ve a `/sanciones`
3. Observa **encabezados de tabla**:

```
| ID | Nombre | Correo | EQUIPO ATRASADO | FECHA DE SANCIÓN | Strikes | Acciones |
```

✅ **Nueva Columna 1**: "Equipo Atrasado"
   - Muestra: "Laptop Lenovo ThinkPad", "Videoproyector BenQ"
   - Origen: datos del préstamo pendiente del usuario

✅ **Nueva Columna 2**: "Fecha de Sanción"
   - Muestra: Fecha formateada (ej: "27/3/2024, 10:30:00")
   - Calculado: Cuando se asignó el strike

### ✔️ Validaciones de Datos
```
Carlos Ramírez:
  - Equipo Atrasado: "Laptop Lenovo ThinkPad"
  - Fecha Sanción: "27/3/2024, 10:30:00"
  - Strikes: ⚠️/3

Marta Sánchez:
  - Equipo Atrasado: "Videoproyector BenQ"
  - Fecha Sanción: "27/3/2024, 14:15:00"
  - Strikes: ⚠️⚠️/3
```

---

## 🧪 TEST 6: Botón "Asignar Strike" en Sanciones

### 🎯 Objetivo
Verificar que el botón "Asignar Strike" en la tabla de sanciones funciona correctamente.

### ✅ Pasos
1. Login como **admin1@example.com**
2. Ve a `/sanciones`
3. En la fila de **Carlos Ramírez**, click en botón **"Asignar Strike"** (naranja)

### ✔️ Validaciones
```
✅ Botón muestra estado: "Asignando..." (con spinner)
✅ Mensaje: "⚠️ Strike asignado a Carlos Ramírez. Strikes: 2/3"
✅ Tabla se actualiza automáticamente
✅ Nunca va a 4/3, máximo es 3/3
✅ Contadores arriba se recalculan en tiempo real
```

### 🎯 Caso: Llegando a 3 Strikes
Si Carlos ya tenía 2 strikes y asignas 1 más:
```
✅ Mensaje: "⚠️ Strike asignado a Carlos Ramírez. Strikes: 3/3 [SUSPENDIDO]"
✅ Estado usuario cambió a: SUSPENDIDO
✅ En `/sanciones` → Estado badge es rojo "🚫 SUSPENDIDO"
✅ Total de Strikes contador aumenta
✅ Suspendidos contador aumenta
```

---

## 🧪 TEST 7: Botón "Perdonar" en Sanciones

### 🎯 Objetivo
Verificar que "Perdonar" resetea los strikes correctamente.

### ✅ Pasos
1. Login como **admin1@example.com**
2. Ve a `/sanciones`
3. En la fila de **Marta Sánchez**, click en **"Perdonar"** (verde)

### ✔️ Validaciones
```
✅ Botón muestra: "Perdonando..." 
✅ Mensaje: "✅ Sanciones perdonadas para Marta Sánchez. Strikes reseteados."
✅ Usuario: strikes = 0, estado = ACTIVO
✅ Tabla se actualiza inmediatamente
✅ Contadores disminuyen:
   - Total de Strikes: -2 (es decir, 3 → 1)
   - Suspendidos: -1 (es decir, 2 → 1)
```

### ✅ Verificar que usuario puede loguear
```
Email: marta.sanchez@example.com
Password: password123
```
✅ Acceso exitoso (no ve banner rojo, puede solicitar equipos)

---

## 🧪 TEST 8: Protecciones y Validaciones

### Test 8.1: Stock Disponible
**Intenta crear préstamo con equipo sin stock:**
```
POST /api/prestamos/crear
{
  "id_usuario": 5,
  "id_equipo": 8,  // Micrófono (stock total 1, ya hay 1 PENDIENTE)
  "fecha_prestamo": "2024-03-27"
}
```

```
❌ Error 400: "El equipo 'Micrófono Condenser Blue' no tiene disponibilidad en este momento."
```

### Test 8.2: Usuario No Existe
```
POST /api/prestamos/crear
{
  "id_usuario": 999,  // No existe
  "id_equipo": 1,
  "fecha_prestamo": "2024-03-27"
}
```

```
❌ Error 404: "Usuario no encontrado"
```

### Test 8.3: Equipo No Existe
```
POST /api/prestamos/crear
{
  "id_usuario": 5,
  "id_equipo": 999,  // No existe
  "fecha_prestamo": "2024-03-27"
}
```

```
❌ Error 404: "Equipo no encontrado"
```

### Test 8.4: Solo ADMIN puede crear préstamos
```
Login como: luis.gonzalez@example.com (ESTUDIANTE)
```

✅ La ruta `/prestamos` no debe ser accesible (redirecciona)

---

## 🧪 TEST 9: Cálculo Exacto de Fechas Hábiles

### 🎯 Prueba Específica
```
Crear préstamo:
- Fecha Préstamo: Viernes 29 de Marzo, 2024
- Espera: Viernes 26 de Abril, 2024 (exactamente 15 días hábiles)
```

**Conteo manual:**
```
Marzo: 29 (Vie)
Salta: 30 (Sáb), 31 (Dom)
Abril:
  - Semana 1: 1 (Lun), 2 (Mar), 3 (Mié), 4 (Jue), 5 (Vie) = 5 días
  - Salta: 6 (Sáb), 7 (Dom)
  - Semana 2: 8 (Lun), 9 (Mar), 10 (Mié), 11 (Jue), 12 (Vie) = 5 días
  - Salta: 13 (Sáb), 14 (Dom)
  - Semana 3: 15 (Lun), 16 (Mar), 17 (Mié), 18 (Jue), 19 (Vie) = 5 días
  - Salta: 20 (Sáb), 21 (Dom)
  - Semana 4: 22 (Lun), 23 (Mar), 24 (Mié), 25 (Jue), 26 (Vie) = 5 días
                                                        ↑ TOTAL = 15 días
```

### ✅ Tests Adicionales
- **Desde lunes**: Debe dejar fines de semana correctamente
- **Desde sábado**: No debería contar ese día
- **Desde domingo**: No debería contar ese día

---

## 📊 MATRIZ DE VALIDACIÓN

| # | Test | Validación | Status |
|---|------|-----------|--------|
| 1 | Cálculo 15 días hábiles | Fecha correcta (±1 día) | ✅/❌ |
| 2 | [ALERTA CORREO] en consola | Loguea por vencidos | ✅/❌ |
| 3 | Botón Strike gris/naranja | Condicional funciona | ✅/❌ |
| 4 | Contadores dinámicos | Dashboard se actualiza | ✅/❌ |
| 5 | Tabla nuevas columnas | Equipo y Fecha visible | ✅/❌ |
| 6 | Botón Asignar Strike | Incrementa counter | ✅/❌ |
| 7 | Botón Perdonar | Reset a 0 strikes | ✅/❌ |
| 8.1 | Stock sin disponible | Error 400 | ✅/❌ |
| 8.2 | Usuario no existe | Error 404 | ✅/❌ |
| 8.3 | Equipo no existe | Error 404 | ✅/❌ |
| 8.4 | Solo ADMIN crea | Ruta protegida | ✅/❌ |
| 9 | Fechas exactas | 15 días sin fines de semana | ✅/❌ |

---

## 🚨 TROUBLESHOOTING

### "El botón 'Asignar Strike' está gris pero el préstamo está vencido"
```javascript
// En consola del navegador:
fetch('http://localhost:3001/api/prestamos')
  .then(r => r.json())
  .then(d => {
    d.prestamos.forEach(p => {
      const hoy = new Date();
      const fecha = new Date(p.fecha_devolucion);
      console.log(`ID: ${p.id}, Vencido: ${hoy > fecha}, Fecha: ${fecha}`);
    });
  });
```

### "Contadores no se actualizan dinámicamente"
- Verifica que `/api/sanciones/dashboard` devuelve datos corretos
- Revisa en Network tab que fetch está haciendo GET a ese endpoint
- Limpia cache: Ctrl+Shift+Delete → Cached images/files → Clear

### "Fecha de devolución no se calcula"
- Revisa que en backend `calcularFechaConDiasHabiles()` existe
- En Network → POST /api/prestamos/crear → Response debe incluir `fecha_devolucion`

### "[ALERTA CORREO] no aparece en consola"
- ¿El backend está corriendo en terminal separada?
- ¿Los préstamos estado=PENDIENTE y fecha_devolucion < hoy?
- Refresh `/prestamos` para forzar el GET

---

## ✅ CHECKLIST DE COMPLETITUD

- [ ] Test 1: Cálculo 15 días hábiles ✅
- [ ] Test 2: Alertas en consola ✅
- [ ] Test 3: Botón condicional ✅
- [ ] Test 4: Contadores dinámicos ✅
- [ ] Test 5: Nuevas columnas tabla ✅
- [ ] Test 6: Asignar Strike funciona ✅
- [ ] Test 7: Perdonar funciona ✅
- [ ] Test 8: Validaciones correctas ✅
- [ ] Test 9: Fechas exactas ✅
- [ ] Troubleshooting resuelto ✅

**🎉 Si todos los tests pasan = Sistema completamente funcional y listo para producción.**
