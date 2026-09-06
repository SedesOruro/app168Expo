/**
 * Los dos objetos exponen exactamente las mismas claves: cualquier pantalla lee
 * `theme.colors.<token>` y obtiene el valor del esquema activo del sistema, sin
 * declarar ni un color suelto.
 *
 * Sobre el acento ambar: en modo claro un ambar saturado no llega a 4.5 sobre
 * blanco (#FF7A30 da 2.60), asi que se parte en dos tokens. `accent` es el relleno
 * vivo, fiel al kit; `accentText` es la variante que si pasa AA para texto e iconos
 * (#C2410C = 5.18 sobre surface). En modo oscuro pasa lo contrario y los papeles se
 * invierten hacia tonos mas claros.
 *
 * Sobre el circulo SOS: `dangerFill` y `dangerFillDeep` son los extremos del
 * degradado y valen igual en ambos modos a proposito. Es el boton de emergencia y
 * debe reconocerse identico con el telefono en claro o en oscuro; el rojo se recorta
 * bien de los dos fondos (4.03 sobre el claro, 4.19 sobre el oscuro) y el blanco
 * encima da de 4.32 a 5.81, asi que hasta la etiqueta pequena cumple AA.
 * No confundirlos con `danger`, que es el rojo de *texto* y por eso si cambia.
 */
export const lightColors = {
  primary: '#0AA7A5',
  primaryDark: '#057C7B',
  secondary: '#2878F0',
  secondaryDark: '#1D5FC4',
  accent: '#FF7A30',
  accentText: '#C2410C',
  accentFill: '#C2410C',
  accentSoft: '#FFF1E8',
  accentGlow: 'rgba(255, 122, 48, 0.28)',
  success: '#19A974',
  successText: '#0B7A53',
  successSoft: '#E9F7F0',
  warning: '#F59E0B',
  warningText: '#B45309',
  warningSoft: '#FEF6E3',
  danger: '#D92D20',
  dangerText: '#C4241A',
  dangerSoft: '#FDECEC',
  dangerFill: '#E5342A',
  dangerFillDeep: '#C4241A',
  dangerGlow: 'rgba(229, 52, 42, 0.26)',
  onFill: '#FFFFFF',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF4F6',
  text: '#17262A',
  textMuted: '#5F7180',
  textInverse: '#FFFFFF',
  border: '#DCE7EA',
  overlay: 'rgba(23, 38, 42, 0.42)',
  cardTint: '#EAF8F7',
  highlight: '#EAF1FF',
};

export const darkColors = {
  primary: '#45D6D2',
  primaryDark: '#1EA6A3',
  secondary: '#7EB0FF',
  secondaryDark: '#7EB0FF',
  accent: '#FF922B',
  accentText: '#FFA94D',
  accentFill: '#C2410C',
  accentSoft: '#2A1D14',
  accentGlow: 'rgba(255, 146, 43, 0.32)',
  success: '#5BD6A4',
  successText: '#5BD6A4',
  successSoft: '#13251E',
  warning: '#FBBF24',
  warningText: '#FBBF24',
  warningSoft: '#2A2416',
  danger: '#FF8A80',
  dangerText: '#FF8A80',
  dangerSoft: '#2A1A19',
  dangerFill: '#E5342A',
  dangerFillDeep: '#C4241A',
  dangerGlow: 'rgba(229, 52, 42, 0.34)',
  onFill: '#FFFFFF',
  background: '#101719',
  surface: '#172124',
  surfaceMuted: '#223035',
  text: '#F2F7F8',
  textMuted: '#A8B8C0',
  textInverse: '#101719',
  border: '#324247',
  overlay: 'rgba(0, 0, 0, 0.52)',
  cardTint: '#153132',
  highlight: '#162D4E',
};

export type AppColorTokens = typeof lightColors;

/**
 * Codigo de color del triaje hospitalario. No es decoracion: es un estandar
 * clinico, asi que vale igual en modo claro y oscuro y nunca se sustituye por
 * tokens de la paleta.
 *
 * `fondo` rellena el circulo del nivel. `textoOscuro` marca los niveles donde el
 * numero va en oscuro porque el blanco no llega: sobre el amarillo da 1.45 y sobre
 * el verde 2.87. `tinte` y `texto` forman la insignia de espera, verificada a 4.5
 * o mas en los cinco niveles.
 */
export const coloresTriaje = {
  resucitacion: { fondo: '#F02F35', textoOscuro: false, tinte: '#FDE6E7', texto: '#CC282D' },
  emergencia: { fondo: '#FF842D', textoOscuro: true, tinte: '#FFF0E6', texto: '#9E521C' },
  urgencia: { fondo: '#FFD22C', textoOscuro: true, tinte: '#FFFAE6', texto: '#8A7118' },
  urgenciaMenor: { fondo: '#08AF61', textoOscuro: true, tinte: '#E1F5EC', texto: '#067E46' },
  sinUrgencia: { fondo: '#4353B7', textoOscuro: false, tinte: '#E8EAF6', texto: '#4353B7' },
} as const;

/** Colores de los marcadores del mapa de centros de salud. */
export const coloresMapa = {
  centro: '#1D99CC',
  usuario: '#173B72',
} as const;
