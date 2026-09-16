# Desplegar Emergencias 168 en CapRover

Esta guía usa exactamente los mismos dominios, variables y valores de
`docs/DESPLIEGUE.md`. La diferencia es el mecanismo: en vez de `pm2` +
`nginx` instalados a mano en el servidor, cada pieza corre en su propio
contenedor Docker que CapRover construye y expone por ti.

| Pieza | Dominio | App en CapRover |
|---|---|---|
| Backend | `api-central.sedesoruro.gob.bo` | `emergencias168-api` |
| Panel administrativo | `central.sedesoruro.gob.bo` | `emergencias168-admin` |
| Aplicación móvil | — | APK firmado (igual que antes, no cambia) |
| Base de datos | `181.115.157.166:4444` | fuera de CapRover, no cambia |

Se agregaron 3 archivos por pieza (ya están en tu repo):

```
backend/Dockerfile
backend/captain-definition
backend/.dockerignore

admin/Dockerfile
admin/nginx.conf
admin/captain-definition
admin/.dockerignore
```

No se tocó ningún archivo de código. `captain-definition` es lo que CapRover
busca para saber cómo construir la imagen; como es un monorepo, cada pieza
se despliega por separado ejecutando `caprover deploy` **desde dentro de su
propia carpeta** (`backend/` o `admin/`), para que cada una tenga su propio
contexto de build.

---

## 0. Requisitos previos (una sola vez)

Instala el CLI de CapRover en tu máquina:

```bash
npm install -g caprover
```

Conéctalo a tu servidor (te va a pedir la URL del panel y la contraseña):

```bash
caprover login
```

En el panel de CapRover, crea las dos apps (solo el nombre, sin configurar
nada más todavía):

- `emergencias168-api`
- `emergencias168-admin`

---

## 1. Base de datos

Sin cambios respecto a `docs/DESPLIEGUE.md`: la base de datos vive fuera de
CapRover, en `181.115.157.166:4444`. Si todavía no la creaste:

```bash
mysql -h 181.115.157.166 -P 4444 -u root -p -e "CREATE DATABASE \`central-db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -h 181.115.157.166 -P 4444 -u root -p central-db < docs/backend/168-emergencias-integrada.sql
```

Si el servidor de CapRover es distinto al que usabas antes, agrega su IP a la
regla del firewall del servidor de MySQL:

```bash
ufw allow from IP_DEL_SERVIDOR_CAPROVER to any port 4444 proto tcp
```

---

## 2. Backend → app `emergencias168-api`

Despliega desde la carpeta `backend/`:

```bash
cd backend
caprover deploy
```

El CLI te pregunta el servidor y la app: elige `emergencias168-api`. Esto
sube el código, CapRover construye la imagen con `backend/Dockerfile` y la
arranca. La primera vez va a fallar en arrancar porque faltan las variables
de entorno — es normal, se configuran ahora.

### Variables de entorno

En el panel de CapRover → app `emergencias168-api` → **App Configs** →
**Environmental Variables**, pega esto en el modo de texto (el mismo
contenido de `backend/.env.production.example`, con los dos marcadores
`COLOCA_AQUI_` ya sustituidos):

```
NODE_ENV=production
PORT=8080
TZ=America/La_Paz
CORS_ORIGIN=https://central.sedesoruro.gob.bo
HTTP_LOGGING=false
DB_DIALECT=mysql
DB_HOST=181.115.157.166
DB_PORT=4444
DB_NAME=central-db
DB_USER=root
DB_PASSWORD=COLOCA_AQUI_LA_CONTRASENA_DE_MYSQL
DB_LOGGING=false
JWT_SECRET=COLOCA_AQUI_UNA_CLAVE_LARGA_Y_ALEATORIA
JWT_ISSUER=https://api-central.sedesoruro.gob.bo
JWT_EXPIRES_IN=15m
JWT_REFRESH_DAYS=30
SECURITY_SEED_ENABLED=false
SECURITY_SEED_EMAIL=
SECURITY_SEED_PASSWORD=
SECURITY_SEED_FIRST_NAME=
SECURITY_SEED_FIRST_LAST_NAME=
SECURITY_SEED_SECOND_LAST_NAME=
OPERATIONS_SEED_PASSWORD=
STORAGE_LOCAL_DIR=/var/lib/emergencias168/uploads
STORAGE_PUBLIC_URL=https://api-central.sedesoruro.gob.bo/api/storage/file
```

Genera el `JWT_SECRET` con:

```bash
openssl rand -base64 48
```

Deja `SECURITY_SEED_ENABLED=false`: en `true` crea un superadministrador con
contraseña conocida, y en un servidor público eso es una puerta abierta.

### HTTP Settings

En la misma app, pestaña **HTTP Settings**:

- **Container HTTP Port**: `8080` (coincide con `PORT` de arriba).
- **Websocket Support**: actívalo — el seguimiento en vivo de emergencias lo
  necesita (es el mismo requisito que las cabeceras `Upgrade`/`Connection`
  que llevaba el bloque nginx de `docs/DESPLIEGUE.md`; CapRover ya las maneja
  con este toggle, sin nginx.conf propio).
- **Connect New Domain**: `api-central.sedesoruro.gob.bo`.
- **Enable HTTPS**: actívalo después de conectar el dominio (usa Let's
  Encrypt automáticamente, igual que hacía `certbot` antes).

### Persistent Directory (evidencias)

Pestaña **App Configs** → **Persistent Directories**. Agrega:

- **Path in App**: `/var/lib/emergencias168/uploads`
- Dale cualquier nombre de volumen que te sugiera CapRover.

Esto es el reemplazo directo de `mkdir -p /var/lib/emergencias168/uploads`
del despliegue manual: sin esto, cada redespliegue borraría las evidencias
subidas porque quedarían dentro del contenedor descartable.

Después de guardar las variables y el puerto, CapRover reinicia el
contenedor solo. Verifica que arrancó bien en la pestaña **Deployment**
(logs) o con el paso 6 más abajo.

---

## 3. Panel administrativo → app `emergencias168-admin`

A diferencia del backend, aquí las variables `VITE_*` se graban dentro del
JavaScript en el momento de compilar la imagen, no al arrancar el
contenedor — así que no se configuran en CapRover, sino en un archivo antes
de desplegar.

Comprueba que `admin/.env.production` existe y tiene estos valores (ya
debería estar así en tu repo, según `admin/.env.production.example`):

```
VITE_API_URL=https://api-central.sedesoruro.gob.bo/api
VITE_STORAGE_URL=https://api-central.sedesoruro.gob.bo/api/storage/file
VITE_TOKEN_KEY=auth_token
VITE_EDITOR_API_KEY=
```

Despliega desde la carpeta `admin/`:

```bash
cd admin
caprover deploy
```

Elige la app `emergencias168-admin`. El build corre
`node scripts/verificar-entorno.mjs && vite build` dentro de la imagen: si
`admin/.env.production` faltara o apuntara a `localhost`/`http://`, la
construcción se detiene sola con el error, igual que en tu máquina.

### HTTP Settings

- **Container HTTP Port**: `80` (nginx dentro de la imagen escucha ahí).
- **Connect New Domain**: `central.sedesoruro.gob.bo`.
- **Enable HTTPS**: actívalo después de conectar el dominio.

No hace falta Persistent Directory ni Websocket Support aquí: es un sitio
estático.

---

## 4. nginx / certbot manuales

Ya no hacen falta. CapRover trae su propio nginx interno y gestiona los
certificados de Let's Encrypt automáticamente con el toggle **Enable
HTTPS** de cada app — reemplaza toda la sección 4 de `docs/DESPLIEGUE.md`
(los dos `server {}` y el `certbot --nginx ...`).

---

## 5. Aplicación móvil

Esta sección no cambia respecto a `docs/DESPLIEGUE.md`, porque el dominio
público de la API sigue siendo el mismo (`api-central.sedesoruro.gob.bo`):
mientras conectes ese dominio a la app `emergencias168-api` como en el paso
2, la app móvil no necesita ningún ajuste adicional.

### Configuración

```bash
cp .env.production.example .env
```

Debe quedar así (ya lo trae el archivo de ejemplo):

```
EXPO_PUBLIC_API_URL=https://api-central.sedesoruro.gob.bo/api
EXPO_PUBLIC_SOCKET_URL=https://api-central.sedesoruro.gob.bo
EXPO_PUBLIC_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
```

Las direcciones van por HTTPS a propósito: Android bloquea el tráfico en
claro en las compilaciones de producción.

### Llave de firma (solo la primera vez)

Si todavía no tienes `emergencias168.keystore`, genérala y **guárdala en un
lugar seguro fuera del repositorio**. Si la pierdes no podrás publicar
actualizaciones: Android exige que todas las versiones vayan firmadas con la
misma llave.

```bash
keytool -genkeypair -v -keystore emergencias168.keystore -alias emergencias168 -keyalg RSA -keysize 2048 -validity 10000
```

Mueve el archivo a `android/app/` y declara los datos en
`android/gradle.properties` (este archivo está en `.gitignore`, nunca se
versiona):

```properties
EMERGENCIAS168_STORE_FILE=emergencias168.keystore
EMERGENCIAS168_STORE_PASSWORD=COLOCA_AQUI_LA_CONTRASENA_DEL_KEYSTORE
EMERGENCIAS168_KEY_ALIAS=emergencias168
EMERGENCIAS168_KEY_PASSWORD=COLOCA_AQUI_LA_CONTRASENA_DE_LA_LLAVE
```

### Compilar el APK

Comprueba primero que la configuración es de producción:

```bash
npm run verificar-entorno
```

Se detiene si la dirección apunta al emulador, a una IP privada, o usa
`http://`.

```bash
npx expo run:android --variant release
```

El APK sale en `android/app/build/outputs/apk/release/app-release.apk`.
Tarda unos 12 minutos la primera vez, ~45 s las siguientes.

Si `android/gradle.properties` no tiene las llaves, el APK se firma con la
clave de depuración: sirve para probar, pero no para publicar ni para
actualizar una instalación firmada de verdad.

---

## 6. Comprobaciones después de subir

```bash
curl -i https://api-central.sedesoruro.gob.bo/
```

Debe responder `200` con `{"msg":"Servicio activo en modo production"}`.

```bash
grep -rn COLOCA_AQUI_ android/gradle.properties
```

No debe devolver ninguna línea (el backend ya no tiene `.env` en disco: sus
valores viven en las Environmental Variables de CapRover, así que revísalos
ahí visualmente en vez de con `grep`).

Después, desde la aplicación móvil: registra un ciudadano, comprueba que
aparece en `central-db.ciudadanos`, abre el mapa y confirma que carga los
centros de salud.

Para confirmar que el panel quedó bien conectado: entra a
`https://central.sedesoruro.gob.bo` e inicia sesión — si se queda colgado en
"Ingresando...", casi siempre es que `admin/.env.production` no tenía la URL
correcta al momento de hacer `caprover deploy` (hay que corregir el archivo
y volver a desplegar, no se puede arreglar solo desde el panel de CapRover).

---

## Actualizar después del primer despliegue

Cuando cambies código, el redespliegue es el mismo comando de siempre desde
cada carpeta:

```bash
cd backend && caprover deploy
cd admin && caprover deploy
```

Las variables de entorno del backend y el volumen de evidencias se
mantienen entre despliegues. Si cambias algo en `admin/.env.production`,
tienes que volver a desplegar el admin para que el nuevo valor quede
grabado en el JavaScript — cambiarlo en tu máquina no afecta lo que ya está
publicado.

---

## Lo que la aplicación aguanta sin conexión

Sin cambios respecto a `docs/DESPLIEGUE.md`:

- **La sesión sobrevive** a que la Central no responda. Solo se cierra si el
  backend contesta 401 o 403 diciendo que ya no vale.
- **El mapa funciona desde la caché** del teléfono, con el distintivo
  "Datos guardados en el telefono".
- **El botón 168 ofrece llamar** por voz cuando no hay datos móviles.
