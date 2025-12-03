# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Instala pnpm
RUN npm install -g pnpm

# Copia archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instala dependencias
RUN pnpm install --frozen-lockfile

# Copia código fuente
COPY . .

# Construye la aplicación
RUN pnpm build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Instala pnpm
RUN npm install -g pnpm

# Copia archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instala solo dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# Copia la aplicación construida desde el stage anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

# Expone el puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Comando de inicio
CMD ["pnpm", "start"]
