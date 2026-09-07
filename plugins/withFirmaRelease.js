const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Firma de produccion para el APK de Android.
 *
 * La carpeta `android/` es generada y esta fuera del repositorio, asi que cualquier
 * cambio hecho a mano en `build.gradle` desaparece en el siguiente `expo prebuild`.
 * Este plugin vuelve a inyectarlo en cada generacion.
 *
 * Los valores salen de `android/gradle.properties`, que tampoco se versiona: una
 * contrasena de firma no se guarda nunca en el repositorio. Si no estan definidos,
 * el build de release cae a la clave de depuracion para no romper las pruebas
 * locales; ese APK sirve para probar, pero no para publicar ni para actualizar una
 * instalacion ya firmada de verdad.
 */
const BLOQUE_FIRMA = `
        release {
            if (project.hasProperty('EMERGENCIAS168_STORE_FILE')) {
                storeFile file(EMERGENCIAS168_STORE_FILE)
                storePassword EMERGENCIAS168_STORE_PASSWORD
                keyAlias EMERGENCIAS168_KEY_ALIAS
                keyPassword EMERGENCIAS168_KEY_PASSWORD
            }
        }`;

const withFirmaRelease = config =>
  withAppBuildGradle(config, resultado => {
    let gradle = resultado.modResults.contents;

    if (gradle.includes('EMERGENCIAS168_STORE_FILE')) return resultado;

    // 1. Anadir la configuracion de firma junto a la de depuracion.
    gradle = gradle.replace(
      /(signingConfigs \{[\s\S]*?debug \{[\s\S]*?\n        \})/,
      `$1${BLOQUE_FIRMA}`,
    );

    // 2. Que el build de release la use cuando exista.
    gradle = gradle.replace(
      /(release \{\s*\n(?:\s*\/\/[^\n]*\n)*)\s*signingConfig signingConfigs\.debug/,
      `$1            signingConfig project.hasProperty('EMERGENCIAS168_STORE_FILE')\n                ? signingConfigs.release\n                : signingConfigs.debug`,
    );

    resultado.modResults.contents = gradle;
    return resultado;
  });

module.exports = withFirmaRelease;
