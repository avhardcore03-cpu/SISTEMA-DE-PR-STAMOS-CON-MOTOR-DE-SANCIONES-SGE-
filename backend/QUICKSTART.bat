@echo off
REM Script de instalación y ejecución del Backend - SGE (Windows)
REM Hacer doble click para ejecutar

cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   QUICK START - Sistema de Gestión de Equipos Backend      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js no está instalado
    echo 📥 Descárgalo desde: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i

echo ✓ Node.js: %NODE_VER%
echo ✓ npm: %NPM_VER%
echo.

REM Instalar dependencias
echo 📦 Instalando dependencias...
call npm install

if errorlevel 1 (
    echo ❌ Error al instalar dependencias
    pause
    exit /b 1
)

cls
echo ✅ Dependencias instaladas correctamente!
echo.

REM Mensaje final
echo 🚀 LISTO PARA EJECUTAR
echo.
echo OPCIONES:
echo   npm run dev      ^→ Modo desarrollo (reinicia con cambios)
echo   npm start        ^→ Modo producción
echo.
echo RECOMENDADO: npm run dev
echo.
echo El servidor se ejecutará en: http://localhost:5000
echo 📚 Lee README.md para más detalles y ejemplos
echo.
pause
