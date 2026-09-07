/**
 * Comprueba la configuracion antes de compilar el APK de produccion.
 *
 * Un APK que salga apuntando a `10.0.2.2` o a una IP privada no puede hablar con la
 * Central desde ningun telefono real, y `http://` lo bloquea Android en las
 * compilaciones de produccion. Cualquiera de las dos cosas produce una aplicacion
 * que se instala, abre, y falla en manos de alguien que necesita una ambulancia.
 *
 * Ejecutar antes de compilar:  npm run verificar-entorno
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const RAIZ = path.resolve(import.meta.dirname, '..');
const LOCAL = /localhost|127\.0\.0\.1|0\.0\.0\.0|10\.0\.2\.2|192\.168\.|::1/;

// Expo solo lee `.env` al compilar; no hay modos como en Vite.
const ARCHIVOS = ['.env'];

const leerEntorno = () => {
  const valores = {};

  for (const archivo of ARCHIVOS) {
    const ruta = path.join(RAIZ, archivo);
    if (!fs.existsSync(ruta)) continue;

    for (const linea of fs.readFileSync(ruta, 'utf8').split('\n')) {
      const limpia = linea.trim();
      if (!limpia || limpia.startsWith('#')) continue;
      const separador = limpia.indexOf('=');
      if (separador === -1) continue;
      valores[limpia.slice(0, separador).trim()] = limpia.slice(separador + 1).trim();
    }
  }

  return valores;
};

const entorno = leerEntorno();
const problemas = [];

for (const nombre of ['EXPO_PUBLIC_API_URL', 'EXPO_PUBLIC_SOCKET_URL']) {
  const valor = entorno[nombre];

  if (!valor) {
    problemas.push(`${nombre} no esta definida.`);
    continue;
  }

  if (LOCAL.test(valor)) {
    problemas.push(`${nombre} apunta a ${valor}, que solo sirve en desarrollo.`);
  }

  if (valor.startsWith('http://')) {
    problemas.push(
      `${nombre} usa http://. Android bloquea el trafico en claro en produccion.`,
    );
  }
}

if (problemas.length > 0) {
  console.error('\nNo se puede compilar para produccion:\n');
  for (const problema of problemas) console.error(`  - ${problema}`);
  console.error('\nCopia admin/.env.production.example como admin/.env.production y vuelve a intentarlo.\n');
  process.exit(1);
}

console.log('Configuracion de produccion correcta.');
