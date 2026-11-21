/**
 * Llama al numero. En el APK se llamaba sin pasar por el marcador (ACTION_CALL);
 * el navegador no lo permite, asi que se abre el marcador con el numero ya escrito
 * y la persona confirma con un toque. Decision asumida en el plan.
 */
export const llamarDirecto = async (numero: string): Promise<void> => {
  window.location.href = `tel:${numero}`;
};
