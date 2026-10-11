# Desplegar Emergencias 168 en un servidor

Guía para poner en producción las tres piezas del sistema.

| Pieza | Dominio | Qué se sube |
|---|---|---|
| Backend | `api-central.sedesoruro.gob.bo` | Node ejecutando `build/server.js` |
| Panel administrativo | `central.sedesoruro.gob.bo` | Archivos estáticos de `admin/dist` |
| Aplicación móvil | — | APK firmado, se instala en los teléfonos |
| Base de datos | `181.115.157.166:4444` | MySQL, esquema `central-db` |

> **Antes de arrancar nada**, busca el marcador `COLOCA_AQUI_` en los archivos de
> configuración. Marca todo lo que debes sustituir. Si queda alguno sin cambiar, el
> servicio no es seguro:
>
> ```bash
> grep -rn COLOCA_AQUI_ backend/.env
> ```

---

## 1. Base de datos

Crea el esquema y carga la estructura:

```bash
mysql -h 181.115.157.166 -P 4444 -u root -p -e "CREATE DATABASE \`central-db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

```bash
mysql -h 181.115.157.166 -P 4444 -u root -p central-db < docs/backend/reinicio-base-datos.sql
```

Eso borra y recrea todas las tablas y deja los catálogos (204 centros RUES, tipos y
estados), el administrador, los 2 operadores y 2 ciudadanos. El backend no crea
tablas ni datos: este script es la única forma de inicializar la base.

### Sobre exponer MySQL

El puerto 4444 está abierto a internet con la cuenta `root`. Es tu decisión y la
respeto, pero conviene al menos limitar quién puede llegar: restringe el puerto por
firewall a la IP del servidor de la API, para que no acepte conexiones del mundo
entero.

```bash
# En el servidor de MySQL, permitiendo solo al servidor de la API
ufw allow from IP_DEL_SERVIDOR_DE_LA_API to any port 4444 proto tcp
```

---

## 2. Backend

```bash
cd backend && npm ci && npm run build
```

Copia la plantilla y rellena los marcadores:

```bash
cp backend/.env.production.example backend/.env
```

Lo que hay que sustituir:

| Variable | Qué poner |
|---|---|
| `DB_PASSWORD` | La contraseña de MySQL |
| `JWT_SECRET` | Una clave nueva y aleatoria: `openssl rand -base64 48` |

Arranca con un gestor de procesos para que sobreviva a reinicios:

```bash
pm2 start backend/build/server.js --name emergencias168-api --time
```

La carpeta de evidencias debe existir y pertenecer al usuario del servicio:

```bash
mkdir -p /var/lib/emergencias168/uploads && chown -R $USER /var/lib/emergencias168
```

Está fuera del código a propósito: así un redespliegue no borra las evidencias ya
subidas de emergencias reales.

---

## 3. Panel administrativo

```bash
cp admin/.env.production.example admin/.env.production
```

No hay nada que sustituir ahí: son direcciones públicas, sin secretos.

```bash
cd admin && npm ci && npm run build
```

El build comprueba la configuracion antes de empezar y **se detiene** si las
direcciones apuntan a localhost o usan `http://`. Vite carga `.env` en todos los
modos, asi que sin `.env.production` el panel saldria apuntando a tu equipo de
desarrollo y el fallo no se veria hasta que alguien abriera el panel en el servidor.

Sube el contenido de `admin/dist` al servidor web.

---

## 4. nginx

Dos servidores, uno por dominio. Los certificados con Let's Encrypt:

```bash
certbot --nginx -d central.sedesoruro.gob.bo -d api-central.sedesoruro.gob.bo
```

### Panel administrativo

```nginx
server {
    listen 443 ssl http2;
    server_name central.sedesoruro.gob.bo;

    root /var/www/emergencias168-admin;
    index index.html;

    # El panel es una SPA: cualquier ruta desconocida devuelve index.html.
    # Sin esto, recargar en /emergencias da un 404.
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### API

```nginx
server {
    listen 443 ssl http2;
    server_name api-central.sedesoruro.gob.bo;

    # Las evidencias son fotos y audios; 10 MB es el límite que acepta el backend.
    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;

        # El backend confía en estas cabeceras (`trust proxy`) para registrar la IP
        # real del ciudadano en cada emergencia, no la del proxy.
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket para el seguimiento en vivo de emergencias.
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Redirige el puerto 80 a HTTPS en ambos dominios.

---

## 5. Aplicación móvil

### Configuración

```bash
cp .env.production.example .env
```

Las direcciones van por HTTPS a propósito: Android bloquea el tráfico en claro en
las compilaciones de producción, así que un `http://` deja la aplicación sin poder
hablar con la Central.

### Llave de firma

Genérala una sola vez y **guárdala en lugar seguro**. Si la pierdes no podrás
publicar actualizaciones de la aplicación: Android exige que todas las versiones
vayan firmadas con la misma llave.

```bash
keytool -genkeypair -v -keystore emergencias168.keystore -alias emergencias168 -keyalg RSA -keysize 2048 -validity 10000
```

Mueve el archivo a `android/app/` y declara los datos en `android/gradle.properties`:

```properties
EMERGENCIAS168_STORE_FILE=emergencias168.keystore
EMERGENCIAS168_STORE_PASSWORD=COLOCA_AQUI_LA_CONTRASENA_DEL_KEYSTORE
EMERGENCIAS168_KEY_ALIAS=emergencias168
EMERGENCIAS168_KEY_PASSWORD=COLOCA_AQUI_LA_CONTRASENA_DE_LA_LLAVE
```

Ese archivo queda fuera del repositorio: una contraseña de firma no se versiona.

### Compilar el APK

Comprueba primero que la configuracion es de produccion:

```bash
npm run verificar-entorno
```

Se detiene si la direccion apunta al emulador, a una IP privada, o usa `http://`.
Un APK con cualquiera de esas tres cosas se instala y abre, pero no puede hablar
con la Central desde el telefono de un ciudadano.

```bash
npx expo run:android --variant release
```

El APK sale en `android/app/build/outputs/apk/release/app-release.apk`. Tarda unos
12 minutos la primera vez.

Si `gradle.properties` no tiene las llaves, el APK se firma con la clave de
depuración: sirve para probar, pero no para publicar ni para actualizar una
instalación firmada de verdad.

---

## 6. Comprobaciones después de subir

```bash
curl -i https://api-central.sedesoruro.gob.bo/
```

Debe responder `200` con `{"msg":"Servicio activo en modo production"}`.

```bash
grep -rn COLOCA_AQUI_ backend/.env android/gradle.properties
```

No debe devolver ninguna línea.

Después, desde la aplicación móvil: registra un ciudadano, comprueba que aparece en
`central-db.ciudadanos`, abre el mapa y confirma que carga los centros.

---

## Lo que la aplicación aguanta sin conexión

Conviene saberlo para no confundir un fallo con el comportamiento previsto:

- **La sesión sobrevive** a que la Central no responda. Solo se cierra si el backend
  contesta 401 o 403 diciendo que ya no vale.
- **El mapa funciona desde la caché** del teléfono, con el distintivo "Datos
  guardados en el telefono".
- **El botón 168 ofrece llamar** por voz cuando no hay datos móviles.
