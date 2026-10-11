# Levantar el proyecto completo en local (VS Code + Git Bash)

Comandos verificados en este equipo. Todos se ejecutan desde **Git Bash**.

Raiz del proyecto: `D:\PROYECTOS\app168Expo` → en Git Bash es `/d/PROYECTOS/app168Expo`.

---

## Requisitos (una sola vez)

| Herramienta | Version | Como verificar |
|---|---|---|
| Node.js | >= 22.13 | `node -v` |
| MySQL 8 | via WAMP | `net start wampmysqld64` (requiere admin) |
| JDK 17 | Microsoft OpenJDK | `java -version` |
| Android SDK | con un AVD creado | `emulator -list-avds` |

Variables de entorno de usuario que deben existir (ya configuradas en este equipo):

```
JAVA_HOME         C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot
ANDROID_HOME      C:\Users\<usuario>\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT  igual que ANDROID_HOME
```

> **JDK 17 es obligatorio.** React Native 0.86 fija `jvmToolchain(17)`. Con el JBR 25
> que trae Android Studio, el build falla en las tareas de CMake con
> `A restricted method in java.lang.System has been called`.

Instalar dependencias la primera vez (o tras un `git pull` que toque los package.json):

```bash
cd /d/PROYECTOS/app168Expo
npm install
npm --prefix backend install
npm --prefix admin install
```

---

## El puerto: 8080 vs 8090

Los `.env` del proyecto apuntan al **8080**. En este equipo ese puerto lo ocupa
`AgentService` (el servicio de la app de Claude Code) mientras esta abierta, asi
que el backend se levanta en el **8090** y los otros dos apuntan ahi.

Comprobar antes de empezar:

```bash
netstat -ano | grep -E ":(8080|8090|3000|8081|3306) " | grep LISTENING
```

* Si el **8080 esta libre** (Claude Code cerrado): omite las variables `PORT`,
  `VITE_API_URL` y `EXPO_PUBLIC_API_URL` de los comandos siguientes. Los `.env`
  ya traen los valores correctos.
* Si el **8080 esta ocupado**: usa los comandos tal cual estan escritos abajo.

---

## Paso 1 — MySQL

Desde el icono de WAMP en la bandeja (arranca Apache y MySQL juntos), o como
servicio desde una terminal **como administrador**:

```bash
net start wampmysqld64
```

Verificar que responde:

```bash
netstat -ano | grep ":3306 " | grep LISTENING
```

Si es la primera vez (o para reiniciar la base), crear la base y ejecutar el
script de reinicio. Borra y recrea las 13 tablas con los catalogos, el personal
y los ciudadanos iniciales. El backend no crea tablas por su cuenta:

```bash
cd /d/PROYECTOS/app168Expo
"/c/wamp64/bin/mysql/mysql8.4.7/bin/mysql.exe" -h 127.0.0.1 -u root -p -e "CREATE DATABASE IF NOT EXISTS \`168-db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
"/c/wamp64/bin/mysql/mysql8.4.7/bin/mysql.exe" -h 127.0.0.1 -u root -p 168-db < docs/backend/reinicio-base-datos.sql
```

---

## Paso 2 — Backend (terminal 1)

```bash
cd /d/PROYECTOS/app168Expo/backend
PORT=8090 npm run dev
```

Espera a ver estas dos lineas (tarda ~30 s: compila TypeScript y luego arranca):

```
[database] Base de datos configurada exitosamente. :)
Servicio activo http://localhost:8090 en modo development
```

`npm run dev` usa `tsc-watch`: recompila y reinicia solo al guardar cambios.

Comprobar desde otra terminal:

```bash
curl http://127.0.0.1:8090/
```

---

## Paso 3 — Panel administrativo (terminal 2)

```bash
cd /d/PROYECTOS/app168Expo
VITE_API_URL=http://localhost:8090/api \
VITE_STORAGE_URL=http://localhost:8090/api/storage/file \
npm --prefix admin run dev
```

Abrir **http://localhost:3000**.

> **No uses `npm start` en admin.** Ese script es `vite preview`: sirve el build de
> produccion, que se compilo con el `.env` apuntando al 8080, y el login se queda
> colgado en "Ingresando..." sin dar error. El comando correcto es `npm run dev`.

Credenciales actuales:

| Usuario | Contrasena | Rol |
|---|---|---|
| `admin_test` | `123456` | administrador (5 modulos) |
| `operator_test` | `123456` | operador (2 modulos) |

---

## Paso 4 — Emulador Android (terminal 3)

```bash
"$ANDROID_HOME/emulator/emulator.exe" -avd Pixel_6a &
```

Esperar a que termine de arrancar (~1 min) y confirmar:

```bash
"$ANDROID_HOME/platform-tools/adb.exe" devices
```

Debe aparecer `emulator-5554   device`.

---

## Paso 5 — Aplicacion movil (terminal 4)

```bash
cd /d/PROYECTOS/app168Expo
EXPO_PUBLIC_API_URL=http://10.0.2.2:8090/api \
EXPO_PUBLIC_SOCKET_URL=http://10.0.2.2:8090 \
npm run android
```

`10.0.2.2` es como el emulador Android alcanza el `localhost` de la maquina
anfitriona. En un telefono fisico hay que usar la IP LAN del equipo.

La primera compilacion tarda ~9 min; las siguientes ~45 s porque Gradle cachea.
Al terminar instala el APK, abre la app y deja Metro corriendo.

---

## Orden resumido

```
1. MySQL          (WAMP)                        puerto 3306
2. Backend        PORT=8090 npm run dev         puerto 8090
3. Admin          npm --prefix admin run dev    puerto 3000
4. Emulador       emulator -avd Pixel_6a
5. Movil          npm run android               Metro en 8081
```

El backend debe estar arriba antes que admin y movil: ambos consultan la API al
cargar y fallan si no responde.

---

## Verificaciones utiles

```bash
# los tres proyectos compilan
npm --prefix backend run typecheck && npm --prefix admin run typecheck && npm run typecheck

# pruebas
npm --prefix backend run lint
npm test
```

---

## Problemas frecuentes

**`Port 8081 became busy`** — quedo un Metro huerfano de un intento anterior:

```bash
netstat -ano | grep ":8081 " | grep LISTENING     # anota el PID de la ultima columna
taskkill //PID <pid> //F
```

**El login del panel se queda en "Ingresando..."** — casi siempre es que estas
sirviendo el build (`npm start`) en vez del dev server, o que el backend no esta
arriba. Revisa en las herramientas del navegador a que puerto va la peticion:
debe ser el 8090.

**`No Android connected device found`** — la terminal no tiene `ANDROID_HOME`.
Abre una **terminal nueva** despues de definir las variables de entorno.

**`SDK location not found`** — falta `ANDROID_HOME` o el archivo
`android/local.properties` con `sdk.dir`.

**El emulador no arranca** — comprobar la aceleracion por hardware:

```bash
"$ANDROID_HOME/emulator/emulator.exe" -accel-check
```

---

## Detener todo

```bash
# Ctrl+C en cada terminal, y si algo queda colgado:
taskkill //IM node.exe //F
"$ANDROID_HOME/platform-tools/adb.exe" emu kill
```
