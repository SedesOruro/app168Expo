/**
 * Comprueba la configuracion antes de compilar el panel para produccion.
 *
 * Vite carga `.env` en todos los modos, asi que compilar sin `.env.production` se
 * lleva los valores de desarrollo y el panel sale apuntando a localhost. El fallo
 * no se ve hasta que alguien abre el panel en el servidor y nada responde.
 *
 * Esta comprobacion corre antes del build y lo detiene, que es cuando todavia sale
 * barato arreglarlo.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const RAIZ = path.resolve(import.meta.dirname, '..');
const LOCAL = /localhost|127\.0\.0\.1|0\.0\.0\.0|10\.0\.2\.2|192\.168\.|::1/;

/** Mismo orden de precedencia que usa Vite: lo ultimo gana. */
const ARCHIVOS = ['.env', '.env.production', '.env.local', '.env.production.local'];

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

for (const nombre of ['VITE_API_URL', 'VITE_STORAGE_URL']) {
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
      `${nombre} usa http://. El panel se sirve por HTTPS y el navegador bloqueara esas llamadas.`,
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
