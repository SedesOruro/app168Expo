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

## 4. APK release para probar

`.env` de la raíz con las URLs de producción (respalda tu `.env` de desarrollo antes):

```bash
cp .env .env.desarrollo
cp .env.production.example .env
npm run verificar-entorno
```

Regenerar el proyecto nativo (necesario tras agregar librerías nativas o permisos en `app.json`; sin `--clean` para no perder la llave en `android/`):

```bash
npx expo prebuild --platform android
```

Compilar:

```bash
cd android && ./gradlew assembleRelease && cd ..
```

APK: `android/app/build/outputs/apk/release/app-release.apk`

Instalar en el celular conectado por USB:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

Alternativa en un solo paso (compila e instala):

```bash
npx expo run:android --variant release
```

Volver al `.env` de desarrollo:

```bash
cp .env.desarrollo .env
```
