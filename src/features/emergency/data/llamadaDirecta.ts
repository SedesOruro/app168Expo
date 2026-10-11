import { Linking, PermissionsAndroid, Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

// Android no trae constante para ACTION_CALL en expo-intent-launcher.
const ACCION_LLAMAR = 'android.intent.action.CALL';

/**
 * Llama al numero como si se marcara desde el telefono, sin pasar por el
 * marcador. En Android requiere el permiso CALL_PHONE; si la persona lo niega
 * o el intent falla, se abre el marcador con el numero ya escrito. iOS no
 * permite llamar sin confirmacion, asi que alli siempre se usa `tel:`.
 */
export const llamarDirecto = async (numero: string): Promise<void> => {
  const uri = `tel:${numero}`;

  if (Platform.OS === 'android') {
    try {
      const permiso = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      );
      if (permiso === PermissionsAndroid.RESULTS.GRANTED) {
        await IntentLauncher.startActivityAsync(ACCION_LLAMAR, { data: uri });
        return;
      }
    } catch {
      // Se cae al marcador: mejor una llamada con un toque extra que ninguna.
    }
  }

  await Linking.openURL(uri);
};
