# Guía de Exportación y Despliegue - Crypto Investment Analyzer

Esta guía te ayudará a exportar y desplegar la aplicación **Crypto Investment Analyzer** en un nuevo entorno de desarrollo en Ubuntu.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu máquina Ubuntu:

- **Node.js 22.x o superior**: [Descargar Node.js](https://nodejs.org/)
- **pnpm 9.x o superior**: `npm install -g pnpm`
- **Git**: `sudo apt-get install git`
- **MySQL 8.0 o superior** (o TiDB compatible): Para la base de datos
- **Visual Studio Code** (opcional): Editor recomendado

Verifica las instalaciones:

```bash
node --version
pnpm --version
git --version
mysql --version
```

## Paso 1: Clonar o Descargar el Proyecto

### Opción A: Usando Git (Recomendado)

```bash
# Clona el repositorio
git clone git@github.com:nahuelbrizu/cryptoAnalyzer.git crypto_analyzer
cd crypto_analyzer

# Instala las dependencias
pnpm install
```

### Opción B: Descargar Manualmente

1. Descarga todos los archivos del proyecto
2. Extrae el contenido en una carpeta llamada `crypto_analyzer`
3. Abre una terminal en esa carpeta
4. Ejecuta: `pnpm install`

## Paso 2: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Base de datos
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/crypto_analyzer"

# OAuth (Manus)
VITE_APP_ID="tu_app_id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://login.manus.im"

# JWT Secret (genera uno seguro)
JWT_SECRET="tu_jwt_secret_muy_largo_y_seguro_aqui"

# Información del propietario
OWNER_OPEN_ID="tu_open_id"
OWNER_NAME="Tu Nombre"

# CoinMarketCap API (obtén tu clave en https://coinmarketcap.com/api/)
COINMARKETCAP_API_KEY="tu_clave_api_coinmarketcap"

# Manus APIs (si usas servicios integrados)
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="tu_clave_api"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="tu_clave_frontend"

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
VITE_ANALYTICS_WEBSITE_ID="tu_website_id"

# Branding
VITE_APP_TITLE="Crypto Investment Analyzer"
VITE_APP_LOGO="/logo.svg"
```

### Generar JWT Secret Seguro

```bash
# En Linux/Mac
openssl rand -base64 32

# En Windows (PowerShell)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## Paso 3: Configurar la Base de Datos

### Crear Base de Datos MySQL

```bash
# Conecta a MySQL
mysql -u root -p

# En el cliente MySQL, ejecuta:
CREATE DATABASE crypto_analyzer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crypto_user'@'localhost' IDENTIFIED BY 'contraseña_segura';
GRANT ALL PRIVILEGES ON crypto_analyzer.* TO 'crypto_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Ejecutar Migraciones

```bash
# Genera y aplica las migraciones
pnpm db:push
```

### (Opcional) Poblar con Datos de Prueba

```bash
# Ejecuta el script de seed (si existe)
node server/seed-db.mjs
```

## Paso 4: Instalar Dependencias

```bash
# Instala todas las dependencias del proyecto
pnpm install

# Verifica que todo esté correcto
pnpm tsc --noEmit
```

## Paso 5: Ejecutar en Desarrollo

```bash
# Inicia el servidor de desarrollo
pnpm dev

# La aplicación estará disponible en: http://localhost:3000
```

El servidor incluye:
- **Frontend React**: En http://localhost:5173 (Vite dev server)
- **Backend Express**: En http://localhost:3000
- **Hot Module Replacement (HMR)**: Recarga automática de cambios

## Paso 6: Ejecutar Tests

```bash
# Ejecuta todos los tests
pnpm test

# Ejecuta tests en modo watch
pnpm test:watch

# Ejecuta tests con cobertura
pnpm test:coverage
```

## Paso 7: Construir para Producción

```bash
# Construye la aplicación para producción
pnpm build

# Verifica que la construcción fue exitosa
ls -la dist/
```

## Paso 8: Desplegar en Producción

### Opción A: Usando Node.js Directamente

```bash
# Instala dependencias de producción
pnpm install --prod

# Inicia la aplicación
NODE_ENV=production node dist/server.js
```

### Opción B: Usando PM2 (Recomendado)

```bash
# Instala PM2 globalmente
npm install -g pm2

# Inicia la aplicación con PM2
pm2 start "pnpm start" --name "crypto-analyzer"

# Guarda la configuración
pm2 save

# Habilita el reinicio automático al arrancar
pm2 startup
```

### Opción C: Usando Docker

Crea un archivo `Dockerfile`:

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Instala pnpm
RUN npm install -g pnpm

# Copia archivos
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

COPY . .

# Construye la aplicación
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

Construye y ejecuta:

```bash
docker build -t crypto-analyzer .
docker run -p 3000:3000 -e DATABASE_URL="..." crypto-analyzer
```

### Opción D: Usando Nginx como Reverse Proxy

Crea `/etc/nginx/sites-available/crypto-analyzer`:

```nginx
server {
    listen 80;
    server_name tu_dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Habilita el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/crypto-analyzer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Estructura del Proyecto

```
crypto_analyzer/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Páginas principales
│   │   ├── components/       # Componentes reutilizables
│   │   ├── lib/              # Utilidades y configuración
│   │   └── App.tsx           # Punto de entrada
│   └── index.html
├── server/                    # Backend Express
│   ├── routers.ts            # Procedimientos tRPC
│   ├── db.ts                 # Funciones de base de datos
│   ├── technicalAnalysis.ts  # Algoritmos de análisis técnico
│   ├── investmentScoring.ts  # Sistema de scoring
│   ├── coinmarketcap.ts      # Integración con CoinMarketCap
│   └── syncService.ts        # Servicio de sincronización
├── drizzle/                   # Migraciones de base de datos
│   └── schema.ts             # Definición del esquema
├── shared/                    # Código compartido
├── storage/                   # Funciones de almacenamiento S3
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── vite.config.ts
```

## Características Principales

### Backend
- **tRPC**: API type-safe end-to-end
- **Express**: Framework web ligero
- **Drizzle ORM**: ORM moderno para TypeScript
- **MySQL/TiDB**: Base de datos relacional

### Frontend
- **React 19**: Última versión de React
- **Tailwind CSS 4**: Utilidades CSS
- **Plotly**: Gráficos interactivos
- **shadcn/ui**: Componentes UI accesibles

### Análisis
- **RSI (Relative Strength Index)**: Indicador de momentum
- **MACD (Moving Average Convergence Divergence)**: Indicador de tendencia
- **Bandas de Bollinger**: Indicador de volatilidad
- **SMA (Simple Moving Average)**: Medias móviles (20, 50, 200)
- **Sistema de Scoring**: Evaluación integral de inversión

### Integraciones
- **CoinMarketCap API**: Datos de criptomonedas en tiempo real
- **OAuth (Manus)**: Autenticación de usuarios
- **S3 Storage**: Almacenamiento en la nube

## Solución de Problemas

### Error: "Cannot find module 'drizzle-orm'"

```bash
pnpm install
```

### Error: "Database connection failed"

Verifica:
1. MySQL está ejecutándose: `sudo systemctl status mysql`
2. Credenciales en `.env.local` son correctas
3. Base de datos existe: `mysql -u root -p -e "SHOW DATABASES;"`

### Error: "Port 3000 already in use"

```bash
# Encuentra el proceso usando el puerto
lsof -i :3000

# Mata el proceso
kill -9 <PID>

# O usa otro puerto
PORT=3001 pnpm dev
```

### Error: "ENOSPC: no space left on device"

```bash
# Limpia el caché de pnpm
pnpm store prune

# Limpia node_modules
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Monitoreo en Producción

### Ver logs con PM2

```bash
pm2 logs crypto-analyzer
pm2 monit
```

### Configurar alertas

```bash
pm2 install pm2-auto-pull
pm2 install pm2-logrotate
```

## Actualizaciones

Para actualizar el código:

```bash
# Descarga los cambios
git pull origin main

# Instala nuevas dependencias (si las hay)
pnpm install

# Ejecuta migraciones (si las hay)
pnpm db:push

# Reinicia la aplicación
pm2 restart crypto-analyzer
```

## Seguridad

### Recomendaciones

1. **HTTPS**: Usa certificados SSL/TLS (Let's Encrypt)
2. **Firewall**: Configura UFW para Ubuntu
3. **Variables de Entorno**: Nunca commits `.env.local`
4. **Actualizaciones**: Mantén Node.js y dependencias actualizadas
5. **Backups**: Realiza backups regulares de la base de datos

```bash
# Backup de la base de datos
mysqldump -u crypto_user -p crypto_analyzer > backup.sql

# Restaurar backup
mysql -u crypto_user -p crypto_analyzer < backup.sql
```

## Soporte y Recursos

- **Documentación de tRPC**: https://trpc.io/
- **Documentación de React**: https://react.dev/
- **Documentación de Tailwind**: https://tailwindcss.com/
- **Documentación de Drizzle**: https://orm.drizzle.team/
- **CoinMarketCap API**: https://coinmarketcap.com/api/

## Notas Finales

- La aplicación requiere una conexión a internet para sincronizar datos de CoinMarketCap
- Los datos se actualizan periódicamente según la configuración del servicio de sincronización
- El sistema de scoring se calcula automáticamente basado en indicadores técnicos
- Los usuarios pueden crear alertas de precio personalizadas y listas de seguimiento

¡Felicidades! Ahora tienes tu propia instancia de Crypto Investment Analyzer funcionando.
