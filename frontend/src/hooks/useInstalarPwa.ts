import { useCallback, useEffect, useState } from 'react';

/** Evento no estandar de Chromium; TypeScript no lo trae en lib.dom. */
interface EventoInstalacion extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type FormaInstalacion = 'instalada' | 'boton' | 'ios' | 'no_disponible';

const estaInstalada = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

// iPadOS se presenta como Mac; se distingue por la pantalla tactil.
const esIos = (): boolean =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1);

/**
 * El navegador dispara `beforeinstallprompt` una sola vez y muy pronto, antes de
 * que React monte la pantalla que muestra el boton. Se captura a nivel de modulo
 * para no perderlo.
 */
let eventoGuardado: EventoInstalacion | null = null;
const oyentes = new Set<() => void>();
const avisar = (): void => oyentes.forEach((oyente) => oyente());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (evento) => {
    evento.preventDefault();
    eventoGuardado = evento as EventoInstalacion;
    avisar();
  });
  window.addEventListener('appinstalled', () => {
    eventoGuardado = null;
    avisar();
  });
}

const calcularForma = (): FormaInstalacion => {
  if (estaInstalada()) return 'instalada';
  if (eventoGuardado) return 'boton';
  if (esIos()) return 'ios';
  return 'no_disponible';
};

export const useInstalarPwa = (): { forma: FormaInstalacion; instalar: () => Promise<boolean> } => {
  const [forma, setForma] = useState<FormaInstalacion>(calcularForma);

  useEffect(() => {
    const actualizar = (): void => setForma(calcularForma());
    oyentes.add(actualizar);
    actualizar();
    return () => {
      oyentes.delete(actualizar);
    };
  }, []);

  const instalar = useCallback(async (): Promise<boolean> => {
    if (!eventoGuardado) return false;
    const evento = eventoGuardado;
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    // El evento solo sirve una vez, se acepte o no.
    eventoGuardado = null;
    avisar();
    return outcome === 'accepted';
  }, []);

  return { forma, instalar };
};
