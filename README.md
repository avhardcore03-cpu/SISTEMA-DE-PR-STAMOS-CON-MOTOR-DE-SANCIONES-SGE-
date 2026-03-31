# Sistema de Prestamos con Motor de Sanciones (SGE)

Proyecto fullstack con:

- Backend: Node.js + Express
- Frontend: React + Vite
- Datos: en memoria RAM (sin base de datos externa)

## Requisitos

- Node.js 18+
- npm
- Git

## 1) Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd SISTEMA-DE-PR-STAMOS-CON-MOTOR-DE-SANCIONES-SGE-
```

## 2) Instalar dependencias

```bash
cd backend
npm install

cd ../frontend
npm install
```

## 3) Levantar el backend

Desde la carpeta `backend`:

```bash
npm run dev
```

Backend disponible en: `http://localhost:3001`

## 4) Levantar el frontend

En otra terminal, desde la carpeta `frontend`:

```bash
npm run dev
```

Frontend disponible en: `http://localhost:5173`

## Credenciales de prueba

### Admin

- Email: `admin@example.com`
- Password: `admin`

### Estudiantes activos

- `luis.gonzalez@example.com` / `password123`
- `iris.martinez@example.com` / `password123`
- `andrea.lopez@example.com` / `password123`

### Estudiante suspendido para probar la vista estudiante

- `juan.perez@example.com` / `password123`
- Estado esperado: `SUSPENDIDO`
- Resultado esperado al intentar solicitar prestamo: bloqueo por suspension

### Otros estados de sancion (referencia)

- `carlos.ramirez@example.com` / `password123` -> `OBSERVACION` (1 strike)
- `marta.sanchez@example.com` / `password123` -> `ADVERTENCIA` (2 strikes)

## Notas importantes

- Los datos se cargan en RAM al iniciar el backend.
- Si reinicias el backend, se restablecen inventario, prestamos y sanciones de prueba.
- El catalogo del frontend consume datos desde `GET /api/inventario`.

## Solucion rapida de problemas

- Si no carga el frontend, verifica que backend este corriendo en `3001`.
- Si falla el login, revisa email/password exactos.
- Si `5173` o `3001` estan ocupados, cierra el proceso que usa el puerto.
