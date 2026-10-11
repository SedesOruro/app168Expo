# Deploy rápido — Emergencias 168

Todos los comandos se ejecutan **desde la carpeta raíz** del proyecto (Git Bash).
Guía con explicaciones: [docs/DESPLIEGUE-CAPROVER.md](docs/DESPLIEGUE-CAPROVER.md).

| Pieza | App en CapRover | Dominio |
|---|---|---|
| Backend | `api-central` | `api-central.sedesoruro.gob.bo` |
| Panel admin | `central` | `central.sedesoruro.gob.bo` |

---

## 0. Una sola vez

```bash
npm install -g caprover
caprover login -u https://caprover.app.sedesoruro.gob.bo -n sedes
```

---

## 1. Backend

```bash
npm --prefix backend run typecheck
tar --exclude=node_modules --exclude=build --exclude=.env -cf backend.tar -C backend .
caprover deploy -n sedes -a api-central -t ./backend.tar
rm backend.tar
curl -i https://api-central.sedesoruro.gob.bo/
```

---

## 2. Panel admin

`admin/.env.production` debe apuntar a `https://api-central.sedesoruro.gob.bo/api`.

```bash
npm --prefix admin run typecheck
tar --exclude=node_modules --exclude=dist --exclude=.env -cf admin.tar -C admin .
caprover deploy -n sedes -a central -t ./admin.tar
rm admin.tar
```

---

## 3. Base de datos (solo para reiniciarla — BORRA TODO)

```bash
mysql -h 181.115.157.166 -P 4444 -u root -p central-db < docs/backend/reinicio-base-datos.sql
```

---

## 4. APK release

Solo procesadores ARM (`arm64-v8a`, `armeabi-v7a`) y R8 activado; se configura en `app.json` (`expo-build-properties`).

### Firma (una sola vez)

Los datos de firma van en `~/.gradle/gradle.properties` (fuera del proyecto: sobreviven a `expo prebuild`). Ruta absoluta a la llave de la raíz:

```properties
EMERGENCIAS168_STORE_FILE=D:/PROYECTOS/app168Expo/emergencias168.keystore
EMERGENCIAS168_STORE_PASSWORD=...
EMERGENCIAS168_KEY_ALIAS=emergencias168
EMERGENCIAS168_KEY_PASSWORD=...
```

Sin esto el APK se firma con la llave de depuración (sirve solo para probar).

### Preparar

`.env` de la raíz con las URLs de producción (respalda tu `.env` de desarrollo antes):

```bash
cp .env .env.desarrollo
cp .env.production.example .env
npm run verificar-entorno
```

Regenerar el proyecto nativo (tras cambiar librerías nativas, permisos o `app.json`):

```bash
npx expo prebuild --platform android
```

### APK de prueba (solo arm64, el más liviano)

```bash
cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a && cd ..
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### APKs para distribuir (uno por procesador)

```bash
mkdir -p apk
cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a && cd ..
cp android/app/build/outputs/apk/release/app-release.apk apk/emergencias168-arm64-v8a.apk
cd android && ./gradlew assembleRelease -PreactNativeArchitectures=armeabi-v7a && cd ..
cp android/app/build/outputs/apk/release/app-release.apk apk/emergencias168-armeabi-v7a.apk
```

`arm64-v8a` para casi todos los celulares; `armeabi-v7a` para los que no puedan instalar el primero (Android Go, equipos de 32 bits).

### Volver al `.env` de desarrollo

```bash
cp .env.desarrollo .env
```
