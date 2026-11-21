/**
 * Reduce una foto de la camara antes de subirla, como hacia el APK con
 * `quality: 0.75`. Las fotos de un telefono pasan de 4-8 MB y en una emergencia
 * suele haber mala cobertura: se escala al lado mayor `maxLado` y se pasa a JPEG.
 * Si el navegador no puede decodificarla se sube el archivo original.
 */
export const comprimirImagen = async (archivo: File, maxLado = 1600, calidad = 0.75): Promise<{ blob: Blob; mimeType: string }> => {
  try {
    const bitmap = await createImageBitmap(archivo);
    const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', calidad));
    if (blob) return { blob, mimeType: 'image/jpeg' };
  } catch {
    // Se sube tal cual.
  }
  return { blob: archivo, mimeType: archivo.type || 'image/jpeg' };
};
