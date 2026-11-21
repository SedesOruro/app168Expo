# Emergencias 168 — PWA ciudadana

Clon web de la app móvil (`../src`) como aplicación instalable (PWA). Mismo backend,
mismos endpoints (`/auth/*`, `/mobile/*`). Estructura tomada del panel `../admin`.

## Desarrollo

```bash
cp .env.example .env          # VITE_API_URL, VITE_SOCKET_URL, VITE_MAP_STYLE_URL
npm install
npm run dev                   # http://localhost:3001
```

En este equipo el backend corre en el 8090 (ver `../docs/LEVANTAR-LOCAL.md`):
`VITE_API_URL=http://localhost:8090/api npm run dev`.

## Comandos

```bash
npm run typecheck
npm test                      # vitest
npm run build                 # exige .env.production sin localhost ni http://
```

## Despliegue

Igual que el admin: `Dockerfile` + `nginx.conf` + `captain-definition` (CapRover).
Rellena `.env.production` (copia de `.env.production.example`) antes de compilar:
Vite incrusta las variables en el build.

La PWA debe servirse por **HTTPS**: sin eso el navegador niega ubicación, cámara,
micrófono y el service worker. Si el backend restringe `CORS_ORIGIN`, añade el dominio de la PWA.

## Diferencias con el APK (asumidas)

| Función | APK | PWA |
|---|---|---|
| Llamar al 168 | Llama sin pasar por el marcador | Abre el marcador con el número (un toque más) |
| Sesión | SecureStore cifrado | localStorage |
| Audio | `audio/mp4` | `audio/mp4` si el navegador lo graba; si no, `audio/webm` |
| Foto | expo-image-picker | `<input capture>` + compresión JPEG 0.75 |
| Red | expo-network | `navigator.onLine` |

## Instalar como app (probar en el celular)

La PWA solo se puede instalar desde un origen seguro (HTTPS o `localhost`) y con el
service worker activo, que el servidor de desarrollo (`npm run dev`) no registra.

1. Compila contra el backend local y sírvelo:
   ```bash
   VITE_API_URL=http://localhost:8090/api VITE_SOCKET_URL=http://localhost:8090 npm run build:local
   npm start -- --port 4173
   ```
2. Android (Chrome): conecta el celular por USB con depuración USB activa, abre
   `chrome://inspect/#devices` en la PC, activa *Port forwarding* y reenvía `4173` y `8090`
   a `localhost:4173` y `localhost:8090`. En el celular abre `http://localhost:4173`:
   aparece el aviso **Instalar** en el inicio (o menú ⋮ → *Instalar app*).
3. iPhone (Safari): necesita HTTPS real; despliega en un servidor con certificado y usa
   Compartir → *Agregar a inicio* (el aviso de la app muestra esos pasos).

`build:local` compila en modo `development` para saltar la protección que impide publicar
un build apuntando a `localhost`; para producción usa siempre `npm run build`.
