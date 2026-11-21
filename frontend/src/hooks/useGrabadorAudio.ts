import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Formatos en orden de preferencia. `audio/mp4` es lo que grababa el APK y se
 * reproduce en todos los navegadores del panel; Chrome reciente y Safari lo
 * graban. Si no, se cae a webm/opus (Chrome/Firefox antiguos), que el backend
 * tambien acepta porque admite cualquier `audio/*`.
 */
const FORMATOS = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];

export const elegirFormatoAudio = (): string | null => {
  if (typeof MediaRecorder === 'undefined') return null;
  return FORMATOS.find((f) => MediaRecorder.isTypeSupported(f)) ?? '';
};

/** Extension de archivo para el tipo MIME grabado. */
export const extensionAudio = (mime: string): string => (mime.startsWith('audio/mp4') ? 'm4a' : mime.startsWith('audio/ogg') ? 'ogg' : 'webm');

export type AudioGrabado = { blob: Blob; mimeType: string; duracionMs: number };

/**
 * Grabador con MediaRecorder (equivalente a expo-audio). `detener` devuelve el
 * audio grabado; el microfono se libera siempre al terminar.
 */
export const useGrabadorAudio = () => {
  const [grabando, setGrabando] = useState(false);
  const [duracionMs, setDuracionMs] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trozosRef = useRef<Blob[]>([]);
  const inicioRef = useRef(0);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const liberar = useCallback(() => {
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    intervaloRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setGrabando(false);
  }, []);

  useEffect(() => liberar, [liberar]);

  const iniciar = useCallback(async (): Promise<void> => {
    const formato = elegirFormatoAudio();
    if (formato === null || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('Este navegador no permite grabar audio.');
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      throw new Error('Debe permitir el uso del microfono.');
    }
    streamRef.current = stream;
    const recorder = formato ? new MediaRecorder(stream, { mimeType: formato }) : new MediaRecorder(stream);
    trozosRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) trozosRef.current.push(e.data);
    };
    recorderRef.current = recorder;
    recorder.start();
    inicioRef.current = Date.now();
    setDuracionMs(0);
    intervaloRef.current = setInterval(() => setDuracionMs(Date.now() - inicioRef.current), 250);
    setGrabando(true);
  }, []);

  const detener = useCallback(
    (): Promise<AudioGrabado> =>
      new Promise((resolve, reject) => {
        const recorder = recorderRef.current;
        if (!recorder || recorder.state === 'inactive') {
          liberar();
          reject(new Error('No hay una grabacion en curso.'));
          return;
        }
        const duracion = Date.now() - inicioRef.current;
        recorder.onstop = () => {
          const mimeType = (recorder.mimeType || 'audio/webm').split(';')[0];
          const blob = new Blob(trozosRef.current, { type: mimeType });
          liberar();
          if (blob.size === 0) reject(new Error('No se genero el archivo de audio.'));
          else resolve({ blob, mimeType, duracionMs: duracion });
        };
        recorder.stop();
      }),
    [liberar],
  );

  return { grabando, duracionMs, iniciar, detener };
};
