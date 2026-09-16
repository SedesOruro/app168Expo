# =============================================================================
# Backend de Emergencias 168 - imagen para CapRover
# =============================================================================
# Build en dos etapas: la primera compila TypeScript con las devDependencies,
# la segunda copia solo el resultado y las dependencias de produccion. La
# imagen final no lleva el compilador ni el codigo fuente .ts.
# =============================================================================

# ---- Etapa 1: compilar -------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Etapa 2: imagen final ----------------------------------------------
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

# Carpeta de evidencias (fotos/audios de emergencias). CapRover debe apuntar
# un "Persistent Directory" aqui para que un redespliegue no la borre.
RUN mkdir -p /var/lib/emergencias168/uploads

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/build ./build

# El backend lee PORT de las variables de entorno (por defecto 8080). CapRover
# expone el puerto que se configure en "HTTP Settings" -> Container HTTP Port.
EXPOSE 8080

CMD ["node", "build/server.js"]
