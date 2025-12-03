#!/bin/bash

# ============================================================================
# Crypto Investment Analyzer - Quick Start Script
# Este script automatiza la instalación inicial en Ubuntu
# ============================================================================

set -e

echo "=========================================="
echo "Crypto Investment Analyzer - Quick Start"
echo "=========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Verificar requisitos previos
echo "Verificando requisitos previos..."
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    echo "Descarga desde: https://nodejs.org/"
    exit 1
fi
print_status "Node.js $(node --version) instalado"

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm no está instalado. Instalando..."
    npm install -g pnpm
fi
print_status "pnpm $(pnpm --version) instalado"

# Verificar Git
if ! command -v git &> /dev/null; then
    print_warning "Git no está instalado. Instalando..."
    sudo apt-get update
    sudo apt-get install -y git
fi
print_status "Git $(git --version | cut -d' ' -f3) instalado"

# Verificar MySQL
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL no está instalado"
    echo "Para instalar MySQL en Ubuntu, ejecuta:"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install -y mysql-server"
    echo ""
    read -p "¿Deseas continuar sin MySQL? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
else
    print_status "MySQL instalado"
fi

echo ""
echo "=========================================="
echo "Instalando dependencias del proyecto..."
echo "=========================================="
echo ""

# Instalar dependencias
pnpm install
print_status "Dependencias instaladas"

echo ""
echo "=========================================="
echo "Configuración de variables de entorno"
echo "=========================================="
echo ""

# Crear archivo .env.local si no existe
if [ ! -f .env.local ]; then
    print_warning "Archivo .env.local no encontrado"
    echo ""
    echo "Necesitas configurar las siguientes variables:"
    echo "  - DATABASE_URL: Conexión a MySQL"
    echo "  - COINMARKETCAP_API_KEY: Clave de API de CoinMarketCap"
    echo "  - VITE_APP_ID: ID de aplicación OAuth"
    echo "  - JWT_SECRET: Secreto para sesiones"
    echo ""
    echo "Copia el archivo .env.example a .env.local y edítalo:"
    echo "  cp .env.example .env.local"
    echo "  nano .env.local"
    echo ""
    read -p "¿Deseas continuar? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
else
    print_status "Archivo .env.local configurado"
fi

echo ""
echo "=========================================="
echo "Configuración de base de datos"
echo "=========================================="
echo ""

# Verificar conexión a base de datos
if command -v mysql &> /dev/null; then
    print_status "Ejecutando migraciones de base de datos..."
    pnpm db:push || print_warning "No se pudieron ejecutar las migraciones automáticamente"
else
    print_warning "MySQL no está disponible. Ejecuta manualmente:"
    echo "  pnpm db:push"
fi

echo ""
echo "=========================================="
echo "Verificación de compilación"
echo "=========================================="
echo ""

# Verificar que TypeScript compila correctamente
print_status "Verificando TypeScript..."
pnpm tsc --noEmit || {
    print_error "Errores de TypeScript encontrados"
    exit 1
}

echo ""
echo "=========================================="
echo "Ejecución de tests"
echo "=========================================="
echo ""

# Ejecutar tests
print_status "Ejecutando tests..."
pnpm test || print_warning "Algunos tests fallaron"

echo ""
echo "=========================================="
echo "¡Instalación completada!"
echo "=========================================="
echo ""
echo "Para iniciar el servidor de desarrollo, ejecuta:"
echo "  ${GREEN}pnpm dev${NC}"
echo ""
echo "La aplicación estará disponible en:"
echo "  ${GREEN}http://localhost:3000${NC}"
echo ""
echo "Para más información, consulta:"
echo "  - DEPLOYMENT_GUIDE.md: Guía completa de despliegue"
echo "  - README.md: Documentación del proyecto"
echo ""
print_status "¡Listo para comenzar!"
