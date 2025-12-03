# Instrucciones de Exportación - Crypto Investment Analyzer

Esta guía te explica cómo exportar el proyecto completo a tu máquina local o a un nuevo servidor Ubuntu.

## Método 1: Usando Git (Recomendado)

### Si tienes acceso a un repositorio Git

```bash
# En tu máquina local o servidor Ubuntu
git clone <URL_DEL_REPOSITORIO> crypto_analyzer
cd crypto_analyzer
pnpm install
```

### Si no tienes repositorio Git

```bash
# Inicializa un nuevo repositorio
cd crypto_analyzer
git init
git add .
git commit -m "Initial commit: Crypto Investment Analyzer"

# Luego puedes subirlo a GitHub, GitLab, etc.
git remote add origin <URL_DEL_REPOSITORIO>
git push -u origin main
```

## Método 2: Descargar Archivos Comprimidos

### Crear un archivo comprimido

```bash
# En el servidor actual
cd /home/ubuntu
tar -czf crypto_analyzer.tar.gz crypto_analyzer/

# O con zip
zip -r crypto_analyzer.zip crypto_analyzer/ \
  -x "crypto_analyzer/node_modules/*" \
  -x "crypto_analyzer/.next/*" \
  -x "crypto_analyzer/dist/*" \
  -x "crypto_analyzer/.env.local"
```

### Descargar y extraer

```bash
# En tu máquina local
# Descarga el archivo comprimido

# Extrae el contenido
tar -xzf crypto_analyzer.tar.gz
# O
unzip crypto_analyzer.zip

cd crypto_analyzer
```

## Método 3: Sincronizar con rsync

### Copiar archivos a otro servidor

```bash
# Desde el servidor actual hacia otro servidor
rsync -avz --exclude='node_modules' --exclude='.env.local' \
  --exclude='dist' --exclude='.next' \
  /home/ubuntu/crypto_analyzer/ \
  usuario@nuevo_servidor:/home/usuario/crypto_analyzer/

# O desde tu máquina local
rsync -avz --exclude='node_modules' --exclude='.env.local' \
  usuario@servidor_actual:/home/ubuntu/crypto_analyzer/ \
  ./crypto_analyzer/
```

## Método 4: Usando Docker

### Crear una imagen Docker

```bash
# Crea un Dockerfile (ya incluido en el proyecto)
docker build -t crypto-analyzer:latest .

# Guarda la imagen en un archivo
docker save crypto-analyzer:latest | gzip > crypto-analyzer.tar.gz

# Transfiere el archivo a otro servidor
scp crypto-analyzer.tar.gz usuario@nuevo_servidor:/tmp/

# En el nuevo servidor, carga la imagen
docker load < /tmp/crypto-analyzer.tar.gz

# Ejecuta el contenedor
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://..." \
  -e COINMARKETCAP_API_KEY="..." \
  crypto-analyzer:latest
```

## Archivos Importantes a Exportar

### Estructura de Carpetas

```
crypto_analyzer/
├── client/                    # ✓ Exportar
├── server/                    # ✓ Exportar
├── drizzle/                   # ✓ Exportar (migraciones)
├── shared/                    # ✓ Exportar
├── storage/                   # ✓ Exportar
├── package.json               # ✓ Exportar
├── pnpm-lock.yaml             # ✓ Exportar (importante!)
├── tsconfig.json              # ✓ Exportar
├── vite.config.ts             # ✓ Exportar
├── drizzle.config.ts          # ✓ Exportar
├── DEPLOYMENT_GUIDE.md        # ✓ Exportar
├── QUICK_START.sh             # ✓ Exportar
├── .env.local                 # ✗ NO exportar (contiene secretos)
├── node_modules/              # ✗ NO exportar (reinstalar con pnpm)
├── dist/                      # ✗ NO exportar (reconstruir)
└── .next/                     # ✗ NO exportar (reconstruir)
```

### Archivos de Configuración Críticos

Asegúrate de incluir estos archivos:

- `package.json` - Definición de dependencias
- `pnpm-lock.yaml` - Lock file exacto (CRÍTICO para reproducibilidad)
- `tsconfig.json` - Configuración de TypeScript
- `vite.config.ts` - Configuración de Vite
- `drizzle.config.ts` - Configuración de Drizzle ORM
- `drizzle/schema.ts` - Esquema de base de datos

## Después de Exportar

### En el nuevo entorno

```bash
# 1. Instala dependencias
pnpm install

# 2. Configura variables de entorno
cp .env.example .env.local
# Edita .env.local con tus valores

# 3. Configura la base de datos
pnpm db:push

# 4. Ejecuta tests
pnpm test

# 5. Inicia el servidor
pnpm dev
```

## Verificación de Integridad

### Después de exportar, verifica que todo esté correcto

```bash
# Verifica que TypeScript compila
pnpm tsc --noEmit

# Verifica que todos los tests pasen
pnpm test

# Verifica que el servidor inicia
pnpm dev
```

## Problemas Comunes

### "Cannot find module 'X'"

**Solución**: Reinstala las dependencias
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### "Database connection failed"

**Solución**: Verifica las credenciales en `.env.local`
```bash
# Prueba la conexión
mysql -u usuario -p -h localhost -e "SELECT 1"
```

### "Port 3000 already in use"

**Solución**: Usa otro puerto
```bash
PORT=3001 pnpm dev
```

## Recomendaciones de Seguridad

### Al exportar a producción

1. **Nunca expongas `.env.local`**: Contiene secretos
2. **Usa variables de entorno seguras**: En el servidor, configura variables en el sistema
3. **Actualiza dependencias**: `pnpm update`
4. **Ejecuta tests**: `pnpm test` antes de desplegar
5. **Usa HTTPS**: Configura certificados SSL/TLS

### Proteger secretos

```bash
# En producción, usa variables de entorno del sistema
export DATABASE_URL="mysql://..."
export COINMARKETCAP_API_KEY="..."
export JWT_SECRET="..."

# O usa un archivo .env que no se versionea
echo ".env.local" >> .gitignore
```

## Automatizar Exportación

### Script de exportación

```bash
#!/bin/bash
# export.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
EXPORT_FILE="crypto_analyzer_${TIMESTAMP}.tar.gz"

tar -czf $EXPORT_FILE \
  --exclude='node_modules' \
  --exclude='.env.local' \
  --exclude='dist' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='.DS_Store' \
  crypto_analyzer/

echo "Exportado a: $EXPORT_FILE"
echo "Tamaño: $(du -h $EXPORT_FILE | cut -f1)"
```

Usa el script:
```bash
chmod +x export.sh
./export.sh
```

## Verificación Final

Antes de considerar la exportación completa, verifica:

- [ ] Todos los archivos fuente están incluidos
- [ ] `pnpm-lock.yaml` está incluido
- [ ] `.env.local` NO está incluido
- [ ] `node_modules/` NO está incluido
- [ ] `dist/` NO está incluido
- [ ] Los tests pasan: `pnpm test`
- [ ] TypeScript compila: `pnpm tsc --noEmit`
- [ ] El servidor inicia: `pnpm dev`

## Soporte

Si encuentras problemas durante la exportación:

1. Consulta `DEPLOYMENT_GUIDE.md` para instrucciones detalladas
2. Verifica que tienes todas las dependencias instaladas
3. Revisa los logs de error: `pnpm dev 2>&1 | tee debug.log`
4. Ejecuta los tests para identificar problemas: `pnpm test`

¡Listo para exportar tu aplicación!
