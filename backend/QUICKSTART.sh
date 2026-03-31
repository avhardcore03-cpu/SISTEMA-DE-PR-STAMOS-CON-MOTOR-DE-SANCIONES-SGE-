#!/bin/bash
# Script de instalación y ejecución del Backend - SGE
# Ejecutar con: bash QUICKSTART.sh

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   QUICK START - Sistema de Gestión de Equipos Backend      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "📥 Descárgalo desde: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js: $(node --version)"
echo "✓ npm: $(npm --version)"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo "✅ Dependencias instaladas"
echo ""

# Mensaje final
echo "🚀 Listo para ejecutar!"
echo ""
echo "OPCIONES:"
echo "  npm run dev      → Modo desarrollo (reinicia con cambios)"
echo "  npm start        → Modo producción"
echo ""
echo "INICIO RÁPIDO:"
echo "  npm run dev"
echo ""
echo "El servidor se ejecutará en: http://localhost:3001"
echo "📚 Lee README.md para más detalles y ejemplos"
echo ""
