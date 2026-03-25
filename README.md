# Sistema de Préstamos con Motor de Sanciones (SGE)

Aplicación frontend en React (Vite) con una base de datos local simulada usando `json-server`.

## Requisitos previos

- Node.js 18 o superior
- npm (incluido con Node.js)
- Git

## 1) Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd SISTEMA-DE-PR-STAMOS-CON-MOTOR-DE-SANCIONES-SGE-
```

## 2) Instalar dependencias

```bash
npm install
```

## 3) Levantar la base de datos local (json-server)

En una terminal nueva, entra primero a la carpeta `data`:

```bash
cd data
npx json-server --watch db.json --port 5000
```

La API quedará disponible en:

- `http://localhost:5000/catalogo`
- `http://localhost:5000/inventario`
- `http://localhost:5000/prestamos`
- `http://localhost:5000/sanciones`

## 4) Encender React (frontend)

En otra terminal (sin cerrar la de `json-server`):

```bash
npm run dev
```

Luego abre la URL que muestre Vite en consola (normalmente `http://localhost:5173`).

## Flujo recomendado de ejecución

1. Terminal 1: `cd data` y luego `npx json-server --watch db.json --port 5000`
2. Terminal 2: `npm run dev`

## Solución rápida de problemas

- Si el frontend no carga datos, verifica que `json-server` esté corriendo en el puerto `5000`.
- Si `npm run dev` falla por scripts faltantes, revisa que el archivo `package.json` sea el correcto del proyecto React/Vite.
- Si el puerto `5000` o `5173` está ocupado, cierra el proceso que lo usa o cambia el puerto.
