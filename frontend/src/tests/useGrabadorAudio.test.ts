import { afterEach, describe, expect, it, vi } from 'vitest';
import { elegirFormatoAudio, extensionAudio } from '../hooks/useGrabadorAudio';

describe('elegirFormatoAudio', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('prefiere audio/mp4, que es lo que grababa el APK', () => {
    vi.stubGlobal('MediaRecorder', { isTypeSupported: () => true });
    expect(elegirFormatoAudio()).toBe('audio/mp4');
  });

  it('cae a webm/opus cuando el navegador no graba mp4', () => {
    vi.stubGlobal('MediaRecorder', { isTypeSupported: (f: string) => f.startsWith('audio/webm') });
    expect(elegirFormatoAudio()).toBe('audio/webm;codecs=opus');
  });

  it('devuelve null si el navegador no tiene MediaRecorder', () => {
    vi.stubGlobal('MediaRecorder', undefined);
    expect(elegirFormatoAudio()).toBeNull();
  });
});

describe('extensionAudio', () => {
  it('asigna la extension segun el tipo grabado', () => {
    expect(extensionAudio('audio/mp4')).toBe('m4a');
    expect(extensionAudio('audio/webm')).toBe('webm');
    expect(extensionAudio('audio/ogg')).toBe('ogg');
  });
});
