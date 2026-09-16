# =============================================================================
# Panel administrativo de Emergencias 168 - imagen para CapRover
# =============================================================================
# Vite incrusta las variables VITE_* dentro del JavaScript en el momento del
# build, no al arrancar el contenedor. Por eso admin/.env.production debe
# existir y estar bien relleno ANTES de "caprover deploy": lo que quede en ese
# archivo es lo que sale en la imagen, no se puede cambiar despues desde el
# panel de variables de entorno de CapRover.
# =============================================================================

# ---- Etapa 1: compilar -------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# El script de build (scripts/verificar-entorno.mjs) revisa admin/.env.production
# y se detiene si falta o si apunta a localhost / usa http://.
RUN npm run build

# ---- Etapa 2: servir con nginx -------------------------------------------
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
