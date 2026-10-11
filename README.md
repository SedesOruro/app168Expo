# 168 Emergencias

Solución integrada con tres componentes:

- `./`: aplicación móvil Expo SDK 57 para ciudadanos.
- `backend/`: API REST Express, Sequelize, MySQL y JWT.
- `admin/`: central web para operadores y administradores.

## Puesta en marcha

1. Cree la base en MySQL 8 y ejecute sobre ella `docs/backend/reinicio-base-datos.sql`. El script borra y recrea las 13 tablas, los catálogos (204 centros RUES), el personal inicial (1 administrador y 2 operadores) y 2 ciudadanos. `docs/backend/estructura-base-datos.sql` documenta solo la estructura.
2. Copie `backend/.env.example` a `backend/.env`, cambie `JWT_SECRET`, y configure MySQL.
3. Inicie la API:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

4. Copie `admin/.env.example` a `admin/.env` e inicie la central:

   ```powershell
   cd admin
   npm install
   npm run dev
   ```

5. Copie `.env.example` a `.env`. En Android Emulator puede conservar `10.0.2.2`; en un teléfono físico reemplace esa dirección por la IP local del equipo que ejecuta la API. Luego inicie Expo:

   ```powershell
   npm install
   npm start
   ```

### Desarrollo en tres terminales

Con el emulador Android ya iniciado, puede ejecutar todo así:

```powershell
# Terminal 1: backend con recarga y logs HTTP/SQL
cd D:\PROYECTOS\168EmergenciasExpo\backend
npm run dev

# Terminal 2: administrador web
cd D:\PROYECTOS\168EmergenciasExpo\admin
npm run dev

# Terminal 3: Expo en el emulador Android activo
cd D:\PROYECTOS\168EmergenciasExpo
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
npm run android
```

`HTTP_LOGGING=true` muestra una sola línea por petición con el mismo formato `morgan("dev")` utilizado por el proyecto de referencia: método, endpoint, estado, tiempo y tamaño. `DB_LOGGING=false` evita imprimir todas las consultas internas de Sequelize.

El backend no crea tablas, no ejecuta migraciones ni seeders: la base se inicializa únicamente con el script de reinicio.

## Flujo operativo

La aplicación registra ciudadanos, obtiene ubicación, crea alertas directas o guiadas, calcula el triage en el servidor, adjunta notas/fotos/audio, muestra centros cercanos y consulta el historial real. La central permite asignar operadores, cambiar estados, revisar evidencias, administrar ciudadanos y mantener el catálogo de centros.

## Configuración de compilación móvil

Las compilaciones nativas que utilicen Google Maps deben incorporar la clave de Google Maps correspondiente al proyecto de Expo. Los permisos de ubicación, cámara, fotos y micrófono ya están declarados en `app.json`.
